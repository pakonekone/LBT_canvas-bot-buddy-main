import { useState } from "react";
import { Block } from "@/types/botBuilder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MessageFormProps {
  blockId: string;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  existingConfig?: Record<string, any>;
}

export const MessageForm = ({ blockId, onUpdateBlock, existingConfig }: MessageFormProps) => {
  const [message, setMessage] = useState(existingConfig?.message || "");

  const handleSubmit = () => {
    if (!message.trim()) return;

    onUpdateBlock(blockId, {
      status: "ready",
      config: {
        message: message.trim(),
      },
    });
  };

  return (
    <Card className="p-4 bg-muted/50 border-primary/20">
      <div className="space-y-4">
        <div>
          <Label htmlFor="message" className="text-sm font-medium">
            Message Content
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What message should the bot send?"
            className="mt-1.5"
            rows={4}
          />
          <div className="text-xs text-muted-foreground mt-1 space-y-1">
            <p>You can use fields like {"{user_name}"} to personalize the message</p>
            <a 
              href="https://landbot.io/help/send-message-block" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Learn more about message blocks →
            </a>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-accent hover:bg-accent/90"
          disabled={!message.trim()}
        >
          Save Message Configuration
        </Button>
      </div>
    </Card>
  );
};
