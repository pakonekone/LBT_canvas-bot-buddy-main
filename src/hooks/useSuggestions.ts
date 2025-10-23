import { Block, Suggestion } from "@/types/botBuilder";

// Sugerencias para diferentes contextos

const EMPTY_STATE_SUGGESTIONS: Suggestion[] = [
  {
    id: "empty-1",
    emoji: "📝",
    text: "Add email question",
    prompt: "Add a question asking 'What is your email address?' to collect contact information"
  },
  {
    id: "empty-2",
    emoji: "💬",
    text: "Improve welcome message",
    prompt: "Make the welcome message more engaging and mention we help find dream properties"
  },
  {
    id: "empty-3",
    emoji: "🔗",
    text: "Connect to HubSpot",
    prompt: "Help me configure the HubSpot integration to send leads automatically"
  }
];

const PENDING_HUBSPOT_SUGGESTIONS: Suggestion[] = [
  {
    id: "hubspot-1",
    emoji: "🔗",
    text: "Connect to HubSpot",
    prompt: "Configure the HubSpot block to automatically send collected lead data to my CRM"
  },
  {
    id: "hubspot-2",
    emoji: "📋",
    text: "Add phone question",
    prompt: "Add a question block asking 'What is your phone number?' to collect contact details"
  },
  {
    id: "hubspot-3",
    emoji: "✨",
    text: "Add follow-up message",
    prompt: "Add a message saying 'Thank you! Our team will contact you within 24 hours with property matches'"
  }
];

const BOT_COMPLETE_SUGGESTIONS: Suggestion[] = [
  {
    id: "complete-1",
    emoji: "🚀",
    text: "See in action",
    prompt: "I want to see how the bot works"
  },
  {
    id: "complete-2",
    emoji: "📍",
    text: "Add location details",
    prompt: "Add a question asking 'Which neighborhoods or areas are you interested in?' for better property matching"
  },
  {
    id: "complete-3",
    emoji: "🏠",
    text: "Ask about property features",
    prompt: "Add a question like 'What features are most important to you? (e.g., garage, garden, modern kitchen)'"
  }
];

const AFTER_ADD_BLOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: "add-1",
    emoji: "⚙️",
    text: "Configure this block",
    prompt: "Help me configure the block I just added"
  },
  {
    id: "add-2",
    emoji: "➕",
    text: "Add another question",
    prompt: "Add another question to collect more details about the client's needs"
  },
  {
    id: "add-3",
    emoji: "🚀",
    text: "Test bot",
    prompt: "Open preview to test the conversation flow"
  }
];

const AFTER_UPDATE_SUGGESTIONS: Suggestion[] = [
  {
    id: "update-1",
    emoji: "🚀",
    text: "Test changes",
    prompt: "Open the preview to test how this change affects the bot conversation"
  },
  {
    id: "update-2",
    emoji: "✏️",
    text: "Edit another block",
    prompt: "Help me edit another block to improve the bot flow"
  },
  {
    id: "update-3",
    emoji: "📊",
    text: "Review full flow",
    prompt: "Show me the complete bot flow and suggest improvements"
  }
];

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    id: "default-1",
    emoji: "📝",
    text: "Add a question",
    prompt: "Add a new question to collect more information from users"
  },
  {
    id: "default-2",
    emoji: "💬",
    text: "Add a message",
    prompt: "Add a message block to provide information to users"
  },
  {
    id: "default-3",
    emoji: "🚀",
    text: "Test the bot",
    prompt: "Open the preview to test how the bot conversation works"
  }
];

export const generateContextualSuggestions = (
  blocks: Block[],
  lastActionType?: string
): Suggestion[] => {
  // Si se acaba de añadir un bloque
  if (lastActionType === "add_block") {
    return AFTER_ADD_BLOCK_SUGGESTIONS;
  }

  // Si se acaba de actualizar un bloque
  if (lastActionType === "update_block") {
    return AFTER_UPDATE_SUGGESTIONS;
  }

  // Analizar estado de los bloques
  const hasPendingHubSpot = blocks.some(
    (b) => b.type === "hubspot" && b.status === "pending"
  );
  const hasConfiguredHubSpot = blocks.some(
    (b) => b.type === "hubspot" && b.status === "ready" && b.config?.connected
  );
  const allBlocksReady = blocks.every((b) => b.status === "ready");
  const questionCount = blocks.filter((b) => b.type === "ask-question").length;

  // Bot completamente configurado
  if (hasConfiguredHubSpot && allBlocksReady) {
    return BOT_COMPLETE_SUGGESTIONS;
  }

  // Tiene bloques pero HubSpot está pending
  if (hasPendingHubSpot && questionCount >= 5) {
    return PENDING_HUBSPOT_SUGGESTIONS;
  }

  // Estado por defecto
  return DEFAULT_SUGGESTIONS;
};

export const getEmptyStateSuggestions = (): Suggestion[] => {
  return EMPTY_STATE_SUGGESTIONS;
};
