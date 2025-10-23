export type BlockType =
  | "start"
  | "end"
  | "send-message"
  | "ask-question"
  | "hubspot"
  | "ai-agent";

export type BlockStatus = "pending" | "ready";

export interface BlockConnection {
  id: string;
  sourceBlockId: string;
  targetBlockId: string;
  sourceOutputId?: string; // For AI Agents with multiple outputs
  label?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  position: { x: number; y: number };
  status: BlockStatus;
  config?: Record<string, any>;
  connections?: BlockConnection[]; // List of outgoing connections
}

export interface Suggestion {
  id: string;
  emoji: string;
  text: string;
  prompt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  component?: React.ReactNode;
  blockId?: string;
  suggestions?: Suggestion[];
}

export interface WebhookConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  parameters: Record<string, string>;
}

export interface EmailConfig {
  recipient: string;
  subject: string;
  body: string;
}
