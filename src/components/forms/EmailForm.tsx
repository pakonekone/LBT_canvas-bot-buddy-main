import { useState } from "react";
import { Block, EmailConfig } from "@/types/botBuilder";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { toast } from "sonner";

interface EmailFormProps {
  blockId: string;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  existingConfig?: Record<string, any>;
}

export const EmailForm = ({ blockId, onUpdateBlock, existingConfig }: EmailFormProps) => {
  const [config, setConfig] = useState<EmailConfig>({
    recipient: existingConfig?.recipient || "",
    subject: existingConfig?.subject || "",
    body: existingConfig?.body || "",
  });

  const handleSave = () => {
    if (!config.recipient || !config.subject || !config.body) {
      toast.error("Please fill in all fields");
      return;
    }

    onUpdateBlock(blockId, {
      config,
      status: "ready",
    });

    toast.success(
      `Email block configured! Emails will be sent to ${config.recipient}`
    );
  };

  return (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="space-y-2">
        <Label>Recipient Email</Label>
        <Input
          type="email"
          value={config.recipient}
          onChange={(e) => setConfig({ ...config, recipient: e.target.value })}
          placeholder="user@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          value={config.subject}
          onChange={(e) => setConfig({ ...config, subject: e.target.value })}
          placeholder="Email subject"
        />
      </div>

      <div className="space-y-2">
        <Label>Message Body</Label>
        <Textarea
          value={config.body}
          onChange={(e) => setConfig({ ...config, body: e.target.value })}
          placeholder="Enter your email message..."
          rows={4}
        />
      </div>

      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
        💡 You can configure which user responses get stored in this email by mapping
        fields like name, email, or message.
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Email Settings
      </Button>
    </Card>
  );
};
