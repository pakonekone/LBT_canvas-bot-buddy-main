import { ChatMessage, Block } from "@/types/botBuilder";
import { cn } from "@/lib/utils";
import { Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import { HubSpotToggle } from "./forms/HubSpotToggle";
import { QuestionForm } from "./forms/QuestionForm";
import { MessageForm } from "./forms/MessageForm";
import { ActionSummary } from "./ActionSummary";
import { FlowCompleteChatCard } from "./FlowCompleteChatCard";
import { SuggestionChips } from "./SuggestionChips";
import { useState } from "react";

interface ChatMessageComponentProps {
  message: ChatMessage;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  blocks: Block[];
  onOpenPreview?: () => void;
  onSuggestionClick?: (prompt: string, messageId: string, chipId: string) => void;
}

const renderMessageWithLinks = (content: string, isAssistant: boolean = false) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "underline hover:opacity-80 font-medium",
                isAssistant ? "text-primary" : "text-primary-foreground/90"
              )}
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export const ChatMessageComponent = ({
  message,
  onUpdateBlock,
  blocks,
  onOpenPreview,
  onSuggestionClick,
}: ChatMessageComponentProps) => {
  const isSystem = message.role === "system";
  const isAssistant = message.role === "assistant";
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this is the flow complete celebration
  const isFlowCompleteCelebration = message.content === "FLOW_COMPLETE_CELEBRATION";

  // Check if this is a structured summary message
  const isSummary = isAssistant &&
    message.content.includes('**What I understood:**') &&
    message.content.includes('**Actions taken:**');

  // Forms are now shown on canvas only, not in chat

  // Render Flow Complete Celebration Card
  if (isFlowCompleteCelebration && onOpenPreview) {
    return (
      <div className="flex gap-2 items-start justify-start">
        <div className="max-w-full">
          <FlowCompleteChatCard onSeeInAction={onOpenPreview} />
        </div>
      </div>
    );
  }

  if (isSystem) {
    const MAX_PREVIEW_LENGTH = 150;
    const shouldCollapse = message.content.length > MAX_PREVIEW_LENGTH;
    const displayContent = !isExpanded && shouldCollapse
      ? message.content.substring(0, MAX_PREVIEW_LENGTH) + "..."
      : message.content;

    return (
      <div className="p-3 rounded-xl bg-purple-100">
        <div className="text-sm text-gray-900 italic leading-relaxed">
          {renderMessageWithLinks(displayContent)}
        </div>
        {shouldCollapse && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-medium transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show more
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-2 items-start",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div className={cn(
        "max-w-full",
        isAssistant ? "max-w-full" : "max-w-[80%]"
      )}>
        {isSummary ? (
          <div className="text-sm text-gray-900 leading-relaxed">
            <ActionSummary content={message.content} />
          </div>
        ) : (
          <div>
            <div
              className={cn(
                "rounded-xl p-2 text-sm leading-relaxed",
                isAssistant
                  ? "text-gray-900"
                  : "bg-purple-100 text-gray-900 ml-auto"
              )}
            >
              {renderMessageWithLinks(message.content, isAssistant)}
            </div>

            {/* Render suggestion chips for assistant messages */}
            {isAssistant && message.suggestions && message.suggestions.length > 0 && (
              <SuggestionChips
                suggestions={message.suggestions}
                onChipClick={(prompt, chipId) =>
                  onSuggestionClick?.(prompt, message.id, chipId)
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
