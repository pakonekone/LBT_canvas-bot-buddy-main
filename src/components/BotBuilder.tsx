import { useState, useEffect } from "react";
import { Canvas } from "./Canvas";
import { ChatPanel } from "./ChatPanel";
import { LoadingModal } from "./LoadingModal";
import { TopNavigation } from "./TopNavigation";
import { BotPreviewModal } from "./BotPreviewModal";
import { Block, ChatMessage } from "@/types/botBuilder";
import { useToast } from "@/hooks/use-toast";

const REAL_ESTATE_USE_CASE = "I want a lead generation AI Agent for my real estate company (XYZ Real Estate). It should capture essential details about the property clients are looking for, such as name, email, budget and property type. Once all information is collected, the AI Agent should send the data to HubSpot (to create or update a contact with all captured fields). The AI Agent should use a polite, professional tone, validate email format, and ask clarifying questions if the budget or property type is unclear. It should aim to efficiently gather all relevant lead details to streamline the follow-up process for the sales team. The chatbot should operate entirely in English.";

export const BotBuilder = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeBlockFormId, setActiveBlockFormId] = useState<string | null>(null);
  const [hasSeenFlowComplete, setHasSeenFlowComplete] = useState(false);
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(true);
  const { toast } = useToast();

  // Detect when HubSpot is configured for the first time
  useEffect(() => {
    const isHubSpotConfigured = blocks.some(
      block => block.type === "hubspot" && block.status === "ready" && block.config?.connected
    );

    if (isHubSpotConfigured && !hasSeenFlowComplete && blocks.length > 0) {
      setHasSeenFlowComplete(true);

      // Add celebration message after a short delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `celebration-action-${Date.now()}`,
            role: "assistant",
            content: "FLOW_COMPLETE_CELEBRATION",
            timestamp: new Date(),
            component: null, // Special marker for the See in Action component
          },
        ]);
      }, 500);
    }
  }, [hasSeenFlowComplete, blocks]);

  const handleStart = () => {
    setHasStarted(true);
    setSelectedUseCase(REAL_ESTATE_USE_CASE);

    // Add initial system message
    setMessages([
      {
        id: "1",
        role: "system",
        content: REAL_ESTATE_USE_CASE,
        timestamp: new Date(),
      },
    ]);

    // Simulate bot creation
    setTimeout(() => {
      createInitialBot(REAL_ESTATE_USE_CASE);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Your initial bot structure is ready! You can add, edit, or configure blocks at any time.",
          timestamp: new Date(),
        },
      ]);

      // Add onboarding message with suggestions
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I notice you have pending blocks that need configuration. Would you like to configure them, or add other blocks like additional Ask Question blocks, Send Message blocks, or HubSpot integration?",
            timestamp: new Date(),
            suggestions: [
              {
                id: "onboarding-1",
                emoji: "🔗",
                text: "Configure HubSpot",
                prompt: "Help me configure the HubSpot block to automatically send collected lead data to my CRM"
              },
              {
                id: "onboarding-2",
                emoji: "📋",
                text: "Add phone question",
                prompt: "Add a question block asking 'What is your phone number?' to collect contact details"
              },
              {
                id: "onboarding-3",
                emoji: "✨",
                text: "Add follow-up message",
                prompt: "Add a message saying 'Thank you! Our team will contact you within 24 hours with property matches'"
              }
            ]
          },
        ]);
      }, 500);
    }, 3000);
  };

  const createInitialBot = (useCase: string) => {
    // Create initial blocks for Real Estate lead generation with AI Agent
    const initialBlocks: Block[] = [
      {
        id: "start",
        type: "start",
        position: { x: 0, y: 0 },
        status: "ready",
        connections: [{ id: "c1", sourceBlockId: "start", targetBlockId: "msg1" }]
      },
      {
        id: "msg1",
        type: "send-message",
        position: { x: 0, y: 0 },
        status: "ready",
        config: {
          message: "Hello! Welcome to XYZ Real Estate. I'm here to help you find your perfect property. Let me gather some information to match you with the best options.",
        },
        connections: [{ id: "c2", sourceBlockId: "msg1", targetBlockId: "q1" }]
      },
      {
        id: "q1",
        type: "ask-question",
        position: { x: 0, y: 0 },
        status: "ready",
        config: {
          question: "May I have your full name?",
          variableName: "name",
        },
        connections: [{ id: "c3", sourceBlockId: "q1", targetBlockId: "q2" }]
      },
      {
        id: "q2",
        type: "ask-question",
        position: { x: 0, y: 0 },
        status: "ready",
        config: {
          question: "What is your email address?",
          variableName: "email",
        },
        connections: [{ id: "c4", sourceBlockId: "q2", targetBlockId: "q3" }]
      },
      {
        id: "q3",
        type: "ask-question",
        position: { x: 0, y: 0 },
        status: "ready",
        config: {
          question: "What is your budget range?",
          variableName: "budget",
        },
        connections: [{ id: "c5", sourceBlockId: "q3", targetBlockId: "q4" }]
      },
      {
        id: "q4",
        type: "ask-question",
        position: { x: 0, y: 0 },
        status: "ready",
        config: {
          question: "What type of property are you looking for?",
          variableName: "property_type",
        },
        connections: [{ id: "c6", sourceBlockId: "q4", targetBlockId: "agent1" }]
      },
      // AI AGENT - Lead Qualifier
      {
        id: "agent1",
        type: "ai-agent",
        position: { x: 0, y: 0 },
        status: "ready",
        config: {
          agentName: "Lead Qualifier",
          agentPrompt: "Analyze if this lead is qualified for our real estate services based on their budget and property preferences. Consider them qualified if they have a realistic budget (>$100k) and clear property needs.",
          outputs: [
            { id: "qualified", label: "Qualified" },
            { id: "not_qualified", label: "Not Qualified" }
          ]
        },
        connections: [
          {
            id: "c8a",
            sourceBlockId: "agent1",
            targetBlockId: "hubspot1",
            sourceOutputId: "qualified",
            label: "Qualified"
          },
          {
            id: "c8b",
            sourceBlockId: "agent1",
            targetBlockId: "msg_nurture",
            sourceOutputId: "not_qualified",
            label: "Not Qualified"
          }
        ]
      },
      // QUALIFIED PATH
      {
        id: "hubspot1",
        type: "hubspot",
        position: { x: 0, y: 0 },
        status: "pending",
        connections: [{ id: "c9", sourceBlockId: "hubspot1", targetBlockId: "msg_qualified" }]
      },
      {
        id: "msg_qualified",
        type: "send-message",
        position: { x: 0, y: 0 },
        status: "ready",
        config: {
          message: "Perfect! Your information has been sent to our team at XYZ Real Estate. One of our agents will contact you within 24 hours with property options that match your criteria.",
        },
        connections: [{ id: "c10", sourceBlockId: "msg_qualified", targetBlockId: "end" }]
      },
      // NOT QUALIFIED PATH
      {
        id: "msg_nurture",
        type: "send-message",
        position: { x: 0, y: 0 },
        status: "ready",
        config: {
          message: "Thank you for your interest in XYZ Real Estate! While we don't have properties matching your current criteria, we'd love to stay in touch. Our team will add you to our newsletter for future opportunities that may fit your needs.",
        },
        connections: [{ id: "c11", sourceBlockId: "msg_nurture", targetBlockId: "end" }]
      },
      {
        id: "end",
        type: "end",
        position: { x: 0, y: 0 },
        status: "ready",
      },
    ];

    setBlocks(autoLayoutBlocksWithBranching(initialBlocks));
  };

  const autoLayoutBlocks = (blocksList: Block[]) => {
    const HORIZONTAL_SPACING = 400;
    const VERTICAL_SPACING = 200;
    const BLOCKS_PER_ROW = 3;
    const START_X = 100;
    const START_Y = 100;

    return blocksList.map((block, index) => {
      // Check if this is the end block (usually the last one)
      const isEndBlock = block.type === 'end';

      if (isEndBlock) {
        // Place end block centered on its own row
        const previousBlocksRow = Math.floor((index - 1) / BLOCKS_PER_ROW);
        const endBlockRow = previousBlocksRow + 1;
        const centerX = START_X + (BLOCKS_PER_ROW - 1) * HORIZONTAL_SPACING / 2;

        return {
          ...block,
          position: {
            x: centerX,
            y: START_Y + endBlockRow * VERTICAL_SPACING + 100, // Extra spacing before end
          },
        };
      }

      // Regular blocks: simple left-to-right, top-to-bottom flow
      const row = Math.floor(index / BLOCKS_PER_ROW);
      const col = index % BLOCKS_PER_ROW;

      return {
        ...block,
        position: {
          x: START_X + col * HORIZONTAL_SPACING,
          y: START_Y + row * VERTICAL_SPACING,
        },
      };
    });
  };

  const autoLayoutBlocksWithBranching = (blocksList: Block[]): Block[] => {
    const HORIZONTAL_SPACING = 400;
    const VERTICAL_SPACING = 200;
    const BLOCKS_PER_ROW = 3;
    const START_X = 100;
    const START_Y = 100;

    // Build dependency graph from connections
    const graph = new Map<string, string[]>();
    blocksList.forEach(block => {
      const targets = block.connections?.map(c => c.targetBlockId) || [];
      graph.set(block.id, targets);
    });

    // Assign levels using topological sort
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    const assignLevel = (blockId: string, level: number = 0) => {
      if (visited.has(blockId)) return;
      visited.add(blockId);

      const currentLevel = levels.get(blockId) || 0;
      levels.set(blockId, Math.max(currentLevel, level));

      const targets = graph.get(blockId) || [];
      targets.forEach(targetId => {
        assignLevel(targetId, level + 1);
      });
    };

    assignLevel("start");

    // Group blocks by level for branch detection
    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, blockId) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(blockId);
    });

    // Position blocks using grid layout (3 per row) with branch adjustment
    return blocksList.map((block, index) => {
      const isEndBlock = block.type === 'end';

      if (isEndBlock) {
        // Place end block centered on its own row
        const previousBlocksRow = Math.floor((index - 1) / BLOCKS_PER_ROW);
        const endBlockRow = previousBlocksRow + 1;
        const centerX = START_X + (BLOCKS_PER_ROW - 1) * HORIZONTAL_SPACING / 2;

        return {
          ...block,
          position: {
            x: centerX,
            y: START_Y + endBlockRow * VERTICAL_SPACING + 100, // Extra spacing before end
          },
        };
      }

      // Regular grid layout (3 blocks per row)
      const row = Math.floor(index / BLOCKS_PER_ROW);
      const col = index % BLOCKS_PER_ROW;

      let x = START_X + col * HORIZONTAL_SPACING;
      let y = START_Y + row * VERTICAL_SPACING;

      // Detect if this block is part of a branch
      const level = levels.get(block.id) || 0;
      const blocksInLevel = levelGroups.get(level) || [];
      const isBranch = blocksInLevel.length > 1;

      if (isBranch) {
        // Adjust vertical position to spread branches
        const indexInLevel = blocksInLevel.indexOf(block.id);
        const branchOffset = indexInLevel * 100; // 100px offset between branches
        y += branchOffset;
      }

      return {
        ...block,
        position: { x, y }
      };
    });
  };

  const addBlock = (
    type: Block["type"], 
    suggestedConfig?: Record<string, any>,
    position?: { afterBlockId?: string; beforeBlockId?: string }
  ) => {
    // Prevent adding start or end blocks
    if (type === "start" || type === "end") {
      toast({
        title: "Cannot add block",
        description: "Start and End blocks already exist in your bot.",
        variant: "destructive",
      });
      return;
    }

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      position: { x: 400, y: 300 },
      status: suggestedConfig ? "ready" : "pending",
      config: suggestedConfig,
    };

    const newBlocks = [...blocks];
    let insertIndex = blocks.findIndex((b) => b.type === "end"); // Default: before end

    // Handle position specification
    if (position) {
      if (position.afterBlockId) {
        const targetIndex = blocks.findIndex((b) => b.id === position.afterBlockId);
        if (targetIndex !== -1) {
          insertIndex = targetIndex + 1;
        }
      } else if (position.beforeBlockId) {
        const targetIndex = blocks.findIndex((b) => b.id === position.beforeBlockId);
        if (targetIndex !== -1) {
          insertIndex = targetIndex;
        }
      }
    }

    newBlocks.splice(insertIndex, 0, newBlock);

    // Auto-layout all blocks
    const layoutedBlocks = autoLayoutBlocks(newBlocks);
    setBlocks(layoutedBlocks);
    
    const configStatus = suggestedConfig ? "with suggested values" : "ready for configuration";
    toast({
      title: "Block added",
      description: `${type} block added ${configStatus}.`,
    });
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  const removeBlock = (blockId: string) => {
    // Find the block by ID
    const blockToRemove = blocks.find((b) => b.id === blockId);
    
    if (!blockToRemove) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Block with ID "${blockId}" not found.`,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    // Prevent removing start and end blocks
    if (blockToRemove.type === "start" || blockToRemove.type === "end") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Cannot remove the ${blockToRemove.type} block. Start and End blocks are required for every bot.`,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    // Remove the block by filtering out the ID
    const updatedBlocks = blocks.filter((b) => b.id !== blockId);
    
    // Auto-layout remaining blocks
    const layoutedBlocks = autoLayoutBlocks(updatedBlocks);
    setBlocks(layoutedBlocks);

    toast({
      title: "Block removed",
      description: `${BLOCK_LABELS[blockToRemove.type]} block has been removed.`,
    });
  };

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      },
    ]);
  };

  const removeMessage = (predicate: (msg: ChatMessage) => boolean) => {
    setMessages((prev) => prev.filter(msg => !predicate(msg)));
  };

  const handleRequestBlockConfig = (blockId: string) => {
    // Reset first to ensure useEffect triggers even if same block
    setActiveBlockFormId(null);
    
    // Use setTimeout to ensure state update completes before setting new value
    setTimeout(() => {
      setActiveBlockFormId(blockId);
      
      // Add a message to guide user to canvas
      const block = blocks.find(b => b.id === blockId);
      if (block) {
        addMessage({
          role: "assistant",
          content: `I've opened the configuration form for the ${BLOCK_LABELS[block.type]} block on the canvas. Please configure it there.`,
        });
      }
    }, 0);
  };

  const handleBlockFormClosed = () => {
    setActiveBlockFormId(null);
  };

  const BLOCK_LABELS: Record<Block["type"], string> = {
    start: "Starting point",
    end: "End",
    "send-message": "Send Message",
    "ask-question": "Question",
    hubspot: "HubSpot",
    "ai-agent": "AI Agent",
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <LoadingModal isOpen={isLoading} onStart={handleStart} isStarted={hasStarted} />
      <BotPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        blocks={blocks} 
      />
      <TopNavigation
        onPublish={() => console.log("Publish bot")}
        onTestBot={() => setIsPreviewOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Canvas 
          blocks={blocks} 
          setBlocks={setBlocks} 
          onUpdateBlock={updateBlock}
          activeBlockFormId={activeBlockFormId}
          onBlockFormClosed={handleBlockFormClosed}
        />
        <ChatPanel
          messages={messages}
          onAddMessage={addMessage}
          onRemoveMessage={removeMessage}
          onAddBlock={addBlock}
          onRemoveBlock={removeBlock}
          onUpdateBlock={updateBlock}
          blocks={blocks}
          onRequestBlockConfig={handleRequestBlockConfig}
          onOpenPreview={() => setIsPreviewOpen(true)}
          onClose={() => setIsChatPanelVisible(!isChatPanelVisible)}
          isVisible={isChatPanelVisible}
        />
      </div>
    </div>
  );
};
