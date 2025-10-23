import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Handle, Position } from "@xyflow/react";
import { Block } from "@/types/botBuilder";
import {
  MoreVertical,
  Flag,
  GripVertical,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionForm } from "./forms/QuestionForm";
import { MessageForm } from "./forms/MessageForm";
import { HubSpotToggle } from "./forms/HubSpotToggle";
import { AIAgentForm } from "./forms/AIAgentForm";

interface BlockNodeProps {
  block: Block;
  onUpdateBlock?: (id: string, updates: Partial<Block>) => void;
  blocks?: Block[];
  forceShowForm?: boolean;
  onFormClosed?: () => void;
}

const BLOCK_ICONS = {
  start: "🏁",
  end: "🏁",
  "send-message": "💬",
  "ask-question": "📝",
  hubspot: "👥",
  "ai-agent": "✨",
};

const BLOCK_LABELS = {
  start: "Starting point",
  end: "End",
  "send-message": "Send Message",
  "ask-question": "Ask a question",
  hubspot: "HubSpot",
  "ai-agent": "AI Agent",
};

const BLOCK_DESCRIPTIONS = {
  start: "Where your bot begins",
  end: "Conversation ends here",
  "send-message": "Send a message to the user",
  "ask-question": "Collect information from user",
  hubspot: "Save data to HubSpot",
  "ai-agent": "AI-powered decision making",
};

const constrainToViewport = (position: { top: number; left: number }, formWidth: number = 400, headerHeight: number = 48) => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  return {
    top: Math.max(0, Math.min(position.top, viewportHeight - headerHeight)),
    left: Math.max(-formWidth + 100, Math.min(position.left, viewportWidth - 100))
  };
};

export const BlockNode = ({ block, onUpdateBlock, blocks = [], forceShowForm, onFormClosed }: BlockNodeProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formPosition, setFormPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);
  const icon = BLOCK_ICONS[block.type];
  const label = BLOCK_LABELS[block.type];
  const description = BLOCK_DESCRIPTIONS[block.type];

  // Programmatically open form when requested
  useEffect(() => {
    if (forceShowForm) {
      setShowForm(true);
    }
  }, [forceShowForm, showForm]);

  useEffect(() => {
    if (showForm && blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const estimatedFormHeight = block.type === 'hubspot' ? 600 : 400;
      
      let top = rect.bottom + 8;
      let left = rect.left;
      
      // If form would go off bottom, position at top instead
      if (top + estimatedFormHeight > viewportHeight) {
        top = Math.max(50, viewportHeight - estimatedFormHeight - 20);
      }
      
      setFormPosition(constrainToViewport({ top, left }));
    }
  }, [showForm, block.type]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        top: e.clientY - dragOffset.y,
        left: e.clientX - dragOffset.x,
      };
      setFormPosition(constrainToViewport(newPosition));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (block.type !== "start" && block.type !== "end" && onUpdateBlock) {
      setShowForm(!showForm);
    }
  };

  const handleFormUpdate = (id: string, updates: Partial<Block>) => {
    if (onUpdateBlock) {
      onUpdateBlock(id, updates);
      setShowForm(false);
      onFormClosed?.();
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    onFormClosed?.();
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const formElement = e.currentTarget.parentElement;
    if (formElement) {
      const rect = formElement.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Render starting point block differently
  if (block.type === "start") {
    return (
      <div className="relative">
        <div className="bg-card px-4 py-3 shadow-md border border-border flex items-center gap-3 w-56">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
          {/* Connection dot */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-canvas-bg"></div>
        </div>
      </div>
    );
  }

  // Render AI Agent block with multiple outputs
  if (block.type === "ai-agent") {
    const outputs = block.config?.outputs || [
      { id: "output1", label: "Output 1" },
      { id: "output2", label: "Output 2" }
    ];

    return (
      <>
        <div className="relative" ref={blockRef}>
          <div
            className={cn(
              "bg-card shadow-lg border transition-all hover:shadow-xl w-64 relative cursor-pointer",
              block.status === "pending"
                ? "border-2 border-amber-500 bg-amber-50/50 animate-pulse-border"
                : "border-border"
            )}
            onClick={handleClick}
          >
            {/* Pending Badge */}
            {block.status === "pending" && (
              <div className="absolute -top-2 -right-2 z-10 bg-amber-500 text-white rounded-full p-1.5 shadow-lg animate-bounce">
                <AlertCircle className="h-4 w-4" />
              </div>
            )}

            {/* Header */}
            <div className="p-3 bg-muted/30 flex items-center gap-2 border-b border-border">
              <div className="text-2xl">{icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">
                  {block.config?.agentName || "Configure agent..."}
                </div>
              </div>
              <button
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(e);
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Outputs */}
            <div className="p-2 space-y-1.5">
              {outputs.map((output: { id: string; label: string }, index: number) => (
                <div key={output.id} className="relative">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg px-3 py-2 flex items-center justify-between group hover:shadow-md transition-all">
                    <span className="text-sm font-medium">{output.label}</span>
                    <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <div className="text-primary-foreground">→</div>
                    </div>
                  </div>
                  {/* Handle for this output */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={output.id}
                    style={{
                      right: -8,
                      top: '50%',
                      background: '#ec4899',
                      width: 12,
                      height: 12,
                      border: '2px solid white',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Input connection handle */}
            <Handle
              type="target"
              position={Position.Left}
              style={{
                left: -8,
                top: 52,
                background: 'hsl(var(--primary))',
                width: 12,
                height: 12,
                border: '2px solid white',
              }}
            />
          </div>
        </div>

        {/* Portal Configuration Form */}
        {showForm && onUpdateBlock && createPortal(
          <div
            className={cn(
              "fixed z-[9999] min-w-[400px] max-w-[500px]",
              isDragging && "shadow-2xl"
            )}
            style={{
              top: `${formPosition.top}px`,
              left: `${formPosition.left}px`,
              maxHeight: 'calc(100vh - 100px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-card shadow-2xl border border-border flex flex-col h-full">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-muted border-b border-border flex-shrink-0",
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                onMouseDown={handleDragStart}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium flex-1">{label} Configuration</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseForm();
                }}
                className="absolute -top-3 -right-3 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center text-xs font-bold"
              >
                ×
              </button>

              <div className="overflow-y-auto overflow-x-hidden flex-1">
                <AIAgentForm
                  blockId={block.id}
                  onUpdateBlock={handleFormUpdate}
                  existingConfig={block.config}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }


  return (
    <>
      <div className="relative" ref={blockRef}>
        {/* Main Block */}
        <div
          className={cn(
            "bg-card shadow-lg border transition-all hover:shadow-xl w-56 relative cursor-pointer",
            block.status === "pending"
              ? "border-2 border-amber-500 bg-amber-50/50 animate-pulse-border"
              : "border-border"
          )}
          onClick={handleClick}
        >
          {/* Pending Badge with animation */}
          {block.status === "pending" && (
            <div className="absolute -top-2 -right-2 z-10 bg-amber-500 text-white rounded-full p-1.5 shadow-lg animate-bounce">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          <div className="p-4 flex items-start gap-3">
          {/* Icon/Emoji */}
          <div className="text-2xl flex-shrink-0">{icon}</div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn(
                "font-semibold text-sm mb-0.5",
                block.status === "pending" && "text-amber-900"
              )}>
                {label}
              </div>
              {block.status === "pending" && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                  ⚠️ Setup Required
                </span>
              )}
            </div>
            {block.config?.question ? (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {block.config.question}
              </div>
            ) : block.config?.message ? (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {block.config.message}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {description}
              </div>
            )}
          </div>
          
          {/* Three dots menu */}
          {block.type !== "end" && (
            <button 
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleClick(e);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
          </div>
          
          {/* Connection dots */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-canvas-bg"></div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-canvas-bg"></div>
        </div>
      </div>

      {/* Portal Configuration Form */}
      {showForm && onUpdateBlock && createPortal(
        <div 
          className={cn(
            "fixed z-[9999] min-w-[400px] max-w-[500px]",
            isDragging && "shadow-2xl"
          )}
          style={{
            top: `${formPosition.top}px`,
            left: `${formPosition.left}px`,
            maxHeight: 'calc(100vh - 100px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-card shadow-2xl border border-border flex flex-col h-full">
            {/* Draggable Header - Fixed, not scrollable */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-muted border-b border-border flex-shrink-0",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              onMouseDown={handleDragStart}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1">{label} Configuration</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseForm();
              }}
              className="absolute -top-3 -right-3 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center text-xs font-bold"
            >
              ×
            </button>
            
            {/* Scrollable Content Area */}
            <div className="overflow-y-auto overflow-x-hidden flex-1">
              {block.type === "ask-question" && (
                <QuestionForm
                  blockId={block.id}
                  onUpdateBlock={handleFormUpdate}
                  existingConfig={block.config}
                />
              )}
              
              {block.type === "send-message" && (
                <MessageForm
                  blockId={block.id}
                  onUpdateBlock={handleFormUpdate}
                  existingConfig={block.config}
                />
              )}
              
              {block.type === "hubspot" && (
                <HubSpotToggle
                  blockId={block.id}
                  onUpdateBlock={handleFormUpdate}
                  existingConfig={block.config}
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
