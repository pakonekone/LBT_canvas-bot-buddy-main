import { useState } from "react";
import { Block } from "@/types/botBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface AIAgentFormProps {
  blockId: string;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  existingConfig?: Record<string, any>;
}

interface Output {
  id: string;
  label: string;
}

export const AIAgentForm = ({ blockId, onUpdateBlock, existingConfig }: AIAgentFormProps) => {
  const [agentName, setAgentName] = useState(existingConfig?.agentName || "");
  const [agentPrompt, setAgentPrompt] = useState(existingConfig?.agentPrompt || "");
  const [outputs, setOutputs] = useState<Output[]>(
    existingConfig?.outputs || [
      { id: "output1", label: "Output 1" },
      { id: "output2", label: "Output 2" }
    ]
  );

  const handleAddOutput = () => {
    const newId = `output${outputs.length + 1}`;
    setOutputs([...outputs, { id: newId, label: `Output ${outputs.length + 1}` }]);
  };

  const handleRemoveOutput = (id: string) => {
    if (outputs.length > 1) {
      setOutputs(outputs.filter(o => o.id !== id));
    }
  };

  const handleOutputLabelChange = (id: string, newLabel: string) => {
    setOutputs(outputs.map(o => o.id === id ? { ...o, label: newLabel } : o));
  };

  const handleSubmit = () => {
    if (!agentName.trim() || !agentPrompt.trim()) return;

    onUpdateBlock(blockId, {
      status: "ready",
      config: {
        agentName: agentName.trim(),
        agentPrompt: agentPrompt.trim(),
        outputs: outputs,
      },
    });
  };

  return (
    <Card className="p-4 bg-muted/50 border-primary/20">
      <div className="space-y-4">
        <div>
          <Label htmlFor="agentName" className="text-sm font-medium">
            Agent Name
          </Label>
          <Input
            id="agentName"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="e.g., Lead Scoring Agent, Sub Agent 03"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A descriptive name for this AI agent
          </p>
        </div>

        <div>
          <Label htmlFor="agentPrompt" className="text-sm font-medium">
            Agent Instructions
          </Label>
          <Textarea
            id="agentPrompt"
            value={agentPrompt}
            onChange={(e) => setAgentPrompt(e.target.value)}
            placeholder="Describe what this AI agent should do..."
            className="mt-1.5"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            The instructions and context for this AI agent
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Outputs (Conditional Paths)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOutput}
              className="h-7 px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Output
            </Button>
          </div>

          <div className="space-y-2">
            {outputs.map((output, index) => (
              <div key={output.id} className="flex gap-2 items-center">
                <Input
                  value={output.label}
                  onChange={(e) => handleOutputLabelChange(output.id, e.target.value)}
                  placeholder={`Output ${index + 1}`}
                  className="flex-1"
                />
                {outputs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOutput(output.id)}
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Each output represents a possible path the conversation can take based on the AI agent&apos;s decision
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-accent hover:bg-accent/90"
          disabled={!agentName.trim() || !agentPrompt.trim()}
        >
          Save AI Agent Configuration
        </Button>
      </div>
    </Card>
  );
};
