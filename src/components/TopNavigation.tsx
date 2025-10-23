import { CheckCircle2, Bot, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface TopNavigationProps {
  onPublish?: () => void;
  onTestBot?: () => void;
}

export const TopNavigation = ({ onPublish, onTestBot }: TopNavigationProps) => {
  const tabs = ["Build", "Design", "Settings", "Share", "Analyze"];
  const activeTab = "Build";

  return (
    <div className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium">New bot</span>
        </div>
        <div className="flex items-center gap-1 ml-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-1.5 text-sm font-medium transition-all rounded-full ${
                tab === activeTab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success" />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-[#E94B8B] text-[#E94B8B] hover:bg-[#E94B8B] hover:text-white"
          onClick={onTestBot}
        >
          Test this bot
        </Button>
        <Button
          size="sm"
          className="bg-[#E94B8B] hover:bg-[#E94B8B]/90 text-white"
          onClick={onPublish}
        >
          Publish
        </Button>
      </div>
    </div>
  );
};