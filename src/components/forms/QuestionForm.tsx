import { useState } from "react";
import { Block } from "@/types/botBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface QuestionFormProps {
  blockId: string;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  existingConfig?: Record<string, any>;
}

export const QuestionForm = ({ blockId, onUpdateBlock, existingConfig }: QuestionFormProps) => {
  const [question, setQuestion] = useState(existingConfig?.question || "");
  const [variableName, setVariableName] = useState(existingConfig?.variableName || "");

  const handleSubmit = () => {
    if (!question.trim() || !variableName.trim()) return;

    onUpdateBlock(blockId, {
      status: "ready",
      config: {
        question: question.trim(),
        variableName: variableName.trim(),
      },
    });
  };

  return (
    <Card className="p-4 bg-muted/50 border-primary/20">
      <div className="space-y-4">
        <div>
          <Label htmlFor="question" className="text-sm font-medium">
            Question Text
          </Label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What question should the bot ask?"
            className="mt-1.5"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="variable" className="text-sm font-medium">
            Field Name
          </Label>
          <Input
            id="variable"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
            placeholder="e.g., user_name, email, phone"
            className="mt-1.5"
          />
          <div className="text-xs text-muted-foreground mt-1 space-y-1">
            <p>This field will store the user&apos;s response</p>
            <a 
              href="https://landbot.io/help/ask-question-block" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Learn more about question blocks →
            </a>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-accent hover:bg-accent/90"
          disabled={!question.trim() || !variableName.trim()}
        >
          Save Question Configuration
        </Button>
      </div>
    </Card>
  );
};
