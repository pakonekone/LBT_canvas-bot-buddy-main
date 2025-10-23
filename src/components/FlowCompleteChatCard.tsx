import { Play } from "lucide-react";

interface FlowCompleteChatCardProps {
  onSeeInAction: () => void;
}

export const FlowCompleteChatCard = ({ onSeeInAction }: FlowCompleteChatCardProps) => {
  return (
    <div className="space-y-3 max-w-full pl-3">
      {/* Message text - clean, no background */}
      <div className="text-sm text-gray-900 leading-relaxed">
        I've created your flow with 11 blocks. Ready to customize it?
      </div>

      {/* Suggestion chip - professional pill style with pink background */}
      <button
        onClick={onSeeInAction}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
      >
        <Play className="h-4 w-4" />
        See in Action
      </button>
    </div>
  );
};
