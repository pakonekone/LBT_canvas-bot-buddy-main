import { useState, useEffect, useRef } from "react";
import { Block } from "@/types/botBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Bot, User as UserIcon } from "lucide-react";

interface BotPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
}

interface PreviewMessage {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

export const BotPreviewModal = ({ isOpen, onClose, blocks }: BotPreviewModalProps) => {
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use blocks in the order they appear in the array (this matches the edge connections)
  const sortedBlocks = blocks;

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setMessages([]);
      setCurrentBlockIndex(0);
      setIsWaitingForInput(false);
      setCollectedData({});
      setIsComplete(false);
      setIsTyping(false);
      // Start bot execution
      executeNextBlock(0);
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 100);
  }, [messages]);

  const addMessage = (role: "bot" | "user", content: string) => {
    const newMessage: PreviewMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(false);
  };

  const executeNextBlock = (index: number) => {
    if (index >= sortedBlocks.length) {
      setIsComplete(true);
      return;
    }

    const block = sortedBlocks[index];

    // Skip blocks that are not ready
    if (block.status !== "ready") {
      setCurrentBlockIndex(index + 1);
      executeNextBlock(index + 1);
      return;
    }

    switch (block.type) {
      case "start":
        // Start block - just move to next
        setCurrentBlockIndex(index + 1);
        setTimeout(() => executeNextBlock(index + 1), 500);
        break;

      case "send-message":
        if (block.config?.message) {
          // Replace field placeholders with collected data
          let message = block.config.message;
          Object.keys(collectedData).forEach(key => {
            message = message.replace(`{${key}}`, collectedData[key]);
          });
          
          setIsTyping(true);
          setTimeout(() => {
            addMessage("bot", message);
            setCurrentBlockIndex(index + 1);
            setTimeout(() => executeNextBlock(index + 1), 1000);
          }, 800);
        } else {
          setCurrentBlockIndex(index + 1);
          executeNextBlock(index + 1);
        }
        break;

      case "ask-question":
        if (block.config?.question) {
          setIsTyping(true);
          setTimeout(() => {
            addMessage("bot", block.config.question);
            setIsWaitingForInput(true);
            setCurrentBlockIndex(index);
          }, 800);
        } else {
          setCurrentBlockIndex(index + 1);
          executeNextBlock(index + 1);
        }
        break;

      case "hubspot":
        if (block.config?.connected) {
          // Generic message without mentioning HubSpot
          const message = "✓ Your information has been saved. Thank you!";
          
          setIsTyping(true);
          setTimeout(() => {
            addMessage("bot", message);
            setCurrentBlockIndex(index + 1);
            setTimeout(() => executeNextBlock(index + 1), 1000);
          }, 800);
        } else {
          setCurrentBlockIndex(index + 1);
          executeNextBlock(index + 1);
        }
        break;

      case "end":
        setIsTyping(true);
        setTimeout(() => {
          addMessage("bot", "Thank you for chatting with us! This conversation has ended.");
          setIsComplete(true);
        }, 800);
        break;

      default:
        setCurrentBlockIndex(index + 1);
        executeNextBlock(index + 1);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || !isWaitingForInput) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    addMessage("user", userMessage);

    // Store the response in the field
    const currentBlock = sortedBlocks[currentBlockIndex];
    if (currentBlock.type === "ask-question" && currentBlock.config?.variableName) {
      setCollectedData(prev => ({
        ...prev,
        [currentBlock.config.variableName]: userMessage
      }));
    }

    // Move to next block
    setIsWaitingForInput(false);
    setCurrentBlockIndex(currentBlockIndex + 1);
    setTimeout(() => executeNextBlock(currentBlockIndex + 1), 1000);
  };

  const handleRestart = () => {
    setMessages([]);
    setCurrentBlockIndex(0);
    setIsWaitingForInput(false);
    setCollectedData({});
    setIsComplete(false);
    setIsTyping(false);
    executeNextBlock(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Bot Preview
          </DialogTitle>
          <DialogDescription>
            Test your bot to see how it will interact with users
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 && !isTyping && (
              <div className="text-center text-muted-foreground py-12">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Starting bot preview...</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "bot" && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[75%] shadow-sm ${
                    message.role === "bot"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t bg-muted/30">
          {isComplete ? (
            <div className="flex gap-3">
              <Button onClick={handleRestart} className="flex-1">
                Restart Preview
              </Button>
              <Button onClick={onClose} variant="outline" className="px-6">
                Close
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={isWaitingForInput ? "Type your response..." : "Waiting for bot..."}
                className="flex-1"
                disabled={!isWaitingForInput}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!isWaitingForInput || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
