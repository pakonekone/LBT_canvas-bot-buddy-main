import { useState, useEffect, useRef } from "react";
import { Block, ChatMessage } from "@/types/botBuilder";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Send, X, Sparkles, Wrench, MessageSquare } from "lucide-react";
import { ChatMessageComponent } from "./ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { generateContextualSuggestions } from "@/hooks/useSuggestions";

interface ChatPanelProps {
  messages: ChatMessage[];
  onAddMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  onRemoveMessage: (predicate: (msg: ChatMessage) => boolean) => void;
  onAddBlock: (
    type: Block["type"],
    config?: Record<string, any>,
    position?: { afterBlockId?: string; beforeBlockId?: string },
  ) => void;
  onRemoveBlock: (blockId: string) => void;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  blocks: Block[];
  onRequestBlockConfig: (blockId: string) => void;
  onOpenPreview?: () => void;
  onClose?: () => void;
  isVisible?: boolean;
}

export const ChatPanel = ({
  messages,
  onAddMessage,
  onRemoveMessage,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
  blocks,
  onRequestBlockConfig,
  onOpenPreview,
  onClose,
  isVisible = true,
}: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'build' | 'ask'>('build');
  const [hiddenFormIds, setHiddenFormIds] = useState<string[]>([]);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current && isVisible) {
        const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isVisible]);

  // Focus input when panel opens
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible]);

  // Adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleUpdateBlock = (id: string, updates: Partial<Block>) => {
    onUpdateBlock(id, updates);
    setHiddenFormIds((prev) => [...prev, id]);
  };

  const handleSuggestionClick = (prompt: string, messageId: string, chipId: string) => {
    // 1. Rellenar el input con el prompt
    setInput(prompt);

    // 2. Hacer focus en el input
    setTimeout(() => inputRef.current?.focus(), 100);

    // 3. Remover el chip del mensaje (para que desaparezca)
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.suggestions) {
          return {
            ...msg,
            suggestions: msg.suggestions.filter((s) => s.id !== chipId),
          };
        }
        return msg;
      })
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Reset textarea height after sending
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.style.height = '40px';
      }
    }, 0);

    onAddMessage({
      role: "user",
      content: userMessage,
    });

    setIsLoading(true);

    try {
      const messagesToSend = messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .slice(-10);

      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: {
          messages: [
            ...messagesToSend.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: userMessage },
          ],
          blocks: blocks.map((b) => ({
            id: b.id,
            type: b.type,
            status: b.status,
            config: b.config || {},
          })),
        },
      });

      if (error) throw error;

      const aiResponse = data?.message || "I apologize, but I couldn't process that request.";
      const toolCalls = data?.actions || data?.tool_calls || [];

      console.log("AI Response:", aiResponse);
      console.log("Tool Calls:", toolCalls);

      // Determinar el tipo de la última acción
      const lastActionType = toolCalls.length > 0 ? toolCalls[0].type : undefined;

      // Generar suggestions contextuales
      const suggestions = generateContextualSuggestions(blocks, lastActionType);

      onAddMessage({
        role: "assistant",
        content: aiResponse,
        suggestions: suggestions,
      });

      for (const call of toolCalls) {
        switch (call.type) {
          case "add_block":
            onAddBlock(
              call.blockType,
              call.config,
              call.position ? { afterBlockId: call.position.afterBlockId, beforeBlockId: call.position.beforeBlockId } : undefined
            );
            break;

          case "update_block":
            onUpdateBlock(call.blockId, call.config);
            if (call.showForm) {
              onRequestBlockConfig(call.blockId);
            }
            break;

          case "show_form":
            onRequestBlockConfig(call.blockId);
            break;

          case "remove_block":
            if (call.blockIds && Array.isArray(call.blockIds)) {
              call.blockIds.forEach((blockId: string) => {
                onRemoveBlock(blockId);
              });
            }
            break;
        }
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      onAddMessage({
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again.",
      });
      toast({
        title: "Connection error",
        description: "Failed to reach the AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Widget when panel is closed
  if (!isVisible) {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[400px] max-w-[calc(100vw-40px)] z-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              onClose?.(); // Open panel
              setTimeout(() => handleSend(), 100);
            }
          }}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-gray-200"
        >
          <MessageSquare className="h-5 w-5 text-gray-400 ml-2" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your bot..."
            className="flex-1 px-2 py-2.5 text-sm outline-none bg-transparent placeholder:text-gray-500"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-full transition-all hover:scale-105 flex items-center justify-center min-w-[44px]"
            aria-label="Send question"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    );
  }

  const placeholder = mode === 'build'
    ? "Build your flow..."
    : "Ask me anything...";

  const hintText = mode === 'build'
    ? "I can add blocks, connect flows, and configure integrations"
    : "I can explain features and help you learn";

  return (
    <div className="w-[420px] border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {/* Branding Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold text-gray-900">Landbot AI copilot</h2>
            <p className="text-sm text-gray-500">Build your bot with natural language</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-1">
          {messages
            .filter((msg) => !msg.blockId || !hiddenFormIds.includes(msg.blockId))
            .filter((msg) => !msg.content.includes('**What I understood:**'))
            .map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                onUpdateBlock={handleUpdateBlock}
                blocks={blocks}
                onOpenPreview={onOpenPreview}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-2 p-3">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2 mb-2 items-end">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2.5 border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-0 focus-visible:border-purple-500 resize-none overflow-y-auto"
            style={{ height: '40px' }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 p-0 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-3">
          {hintText}
        </p>

        {/* Mode Switcher - Below Hint Text */}
        <div className="flex items-center justify-between">
          <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setMode('build')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'build'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              Build
            </button>
            <button
              onClick={() => setMode('ask')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'ask'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
