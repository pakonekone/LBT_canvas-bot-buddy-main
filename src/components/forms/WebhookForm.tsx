import { useState } from "react";
import { Block, WebhookConfig } from "@/types/botBuilder";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";
import { toast } from "sonner";

interface WebhookFormProps {
  blockId: string;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  existingConfig?: Record<string, any>;
}

export const WebhookForm = ({ blockId, onUpdateBlock, existingConfig }: WebhookFormProps) => {
  const [config, setConfig] = useState<WebhookConfig>({
    url: existingConfig?.url || "",
    method: existingConfig?.method || "POST",
    headers: existingConfig?.headers || {},
    parameters: existingConfig?.parameters || {},
  });

  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [paramKey, setParamKey] = useState("");
  const [paramValue, setParamValue] = useState("");

  const addHeader = () => {
    if (headerKey && headerValue) {
      setConfig({
        ...config,
        headers: { ...config.headers, [headerKey]: headerValue },
      });
      setHeaderKey("");
      setHeaderValue("");
    }
  };

  const addParameter = () => {
    if (paramKey && paramValue) {
      setConfig({
        ...config,
        parameters: { ...config.parameters, [paramKey]: paramValue },
      });
      setParamKey("");
      setParamValue("");
    }
  };

  const handleSave = () => {
    if (!config.url) {
      toast.error("Please enter a webhook URL");
      return;
    }

    onUpdateBlock(blockId, {
      config,
      status: "ready",
    });

    toast.success("Webhook block configured successfully!");
  };

  return (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="space-y-2">
        <Label>Webhook URL</Label>
        <Input
          value={config.url}
          onChange={(e) => setConfig({ ...config, url: e.target.value })}
          placeholder="https://api.example.com/webhook"
        />
      </div>

      <div className="space-y-2">
        <Label>Method</Label>
        <Select
          value={config.method}
          onValueChange={(value: any) => setConfig({ ...config, method: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Headers</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Key"
            value={headerKey}
            onChange={(e) => setHeaderKey(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            value={headerValue}
            onChange={(e) => setHeaderValue(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addHeader} variant="outline" size="sm">
            Add
          </Button>
        </div>
        {Object.entries(config.headers).length > 0 && (
          <div className="text-xs space-y-1">
            {Object.entries(config.headers).map(([key, value]) => (
              <div key={key} className="bg-muted p-2 rounded">
                {key}: {value}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Parameters</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Key"
            value={paramKey}
            onChange={(e) => setParamKey(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            value={paramValue}
            onChange={(e) => setParamValue(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addParameter} variant="outline" size="sm">
            Add
          </Button>
        </div>
        {Object.entries(config.parameters).length > 0 && (
          <div className="text-xs space-y-1">
            {Object.entries(config.parameters).map(([key, value]) => (
              <div key={key} className="bg-muted p-2 rounded">
                {key}: {value}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Configuration
      </Button>
    </Card>
  );
};
