import { useState } from "react";
import { Block } from "@/types/botBuilder";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { toast } from "sonner";
import { Users } from "lucide-react";

interface HubSpotToggleProps {
  blockId: string;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  existingConfig?: Record<string, any>;
}

export const HubSpotToggle = ({ blockId, onUpdateBlock, existingConfig }: HubSpotToggleProps) => {
  const [isConnected, setIsConnected] = useState(existingConfig?.connected || false);

  const handleToggle = (checked: boolean) => {
    setIsConnected(checked);
    
    // Auto-save configuration immediately
    onUpdateBlock(blockId, {
      config: {
        connected: checked,
      },
      status: checked ? "ready" : "pending",
    });
    
    if (checked) {
      toast.success("HubSpot integration enabled");
    } else {
      toast.info("HubSpot integration disabled");
    }
  };

  return (
    <Card className="p-4 space-y-4 border-accent/20 bg-accent/5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Users className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">HubSpot Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect your HubSpot account to store leads
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
        <Label htmlFor="hubspot-toggle" className="cursor-pointer">
          {isConnected ? "✅ Connected to HubSpot" : "Connect to HubSpot"}
        </Label>
        <Switch
          id="hubspot-toggle"
          checked={isConnected}
          onCheckedChange={handleToggle}
        />
      </div>

      {isConnected && (
        <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
          Your HubSpot integration is active. Lead data will be automatically sent to HubSpot.
        </div>
      )}
    </Card>
  );
};
