import { useState, useEffect, useRef } from "react";
import { Block, ChatMessage } from "@/types/botBuilder";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Sparkles, X, Minimize2 } from "lucide-react";
import { ChatMessageComponent } from "./ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

interface AICopilotWidgetProps {
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
}

export const AICopilotWidget = ({
  messages,
  onAddMessage,
  onRemoveMessage,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
  blocks,
  onRequestBlockConfig,
  onOpenPreview,
}: AICopilotWidgetProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hiddenFormIds, setHiddenFormIds] = useState<string[]>([]);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current && isExpanded) {
        const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const handleUpdateBlock = (id: string, updates: Partial<Block>) => {
    onUpdateBlock(id, updates);
    setHiddenFormIds((prev) => [...prev, id]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

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
      const toolCalls = data?.tool_calls || [];

      onAddMessage({
        role: "assistant",
        content: aiResponse,
      });

      for (const call of toolCalls) {
        if (call.type === "add_block") {
          onAddBlock(
            call.blockType,
            call.config,
            call.position ? { afterBlockId: call.position.afterBlockId, beforeBlockId: call.position.beforeBlockId } : undefined
          );
        } else if (call.type === "remove_block") {
          for (const blockId of call.blockIds || []) {
            onRemoveBlock(blockId);
          }
        } else if (call.type === "update_block") {
          onUpdateBlock(call.blockId, call.config);
          if (call.showForm) {
            onRequestBlockConfig(call.blockId);
          }
        } else if (call.type === "show_form") {
          onRequestBlockConfig(call.blockId);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Collapsed widget button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50 group"
        aria-label="Open AI Copilot"
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
      </button>
    );
  }

  // Expanded widget
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Copilot</h3>
            <p className="text-xs text-muted-foreground">Your bot building assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(false)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages
            .filter((msg) => !msg.blockId || !hiddenFormIds.includes(msg.blockId))
            .map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                onUpdateBlock={handleUpdateBlock}
                blocks={blocks}
                onOpenPreview={onOpenPreview}
              />
            ))}
          {isLoading && (
            <div className="flex gap-2 items-start">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything or request changes..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          I can add blocks, connect flows, and answer questions
        </p>
      </div>
    </div>
  );
};
