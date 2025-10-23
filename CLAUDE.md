# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered visual chatbot builder called "Canvas Bot Builder" that allows users to create conversational flows using natural language commands. The system combines a React-based visual flow editor (XYFlow) with an AI copilot (Gemini 2.5 Flash via Lovable AI Gateway) to enable intuitive bot building through chat.

**Key Concept**: Users describe what they want ("add a question asking for email"), and the AI translates this into structured actions (add_block, update_block, etc.) that modify the visual canvas in real-time.

### Product Status: Proof of Concept (POC)

**⚠️ This is a POC built on Lovable.dev for rapid prototyping and validation.**

**Purpose**:
- Validate the concept of natural language-driven chatbot building
- Test user interaction patterns with AI-assisted flow creation
- Demonstrate technical feasibility of the architecture
- Gather feedback before building production version

**Current Stage**:
- POC phase - proving core concepts and gathering user feedback
- Built using Lovable platform for rapid iteration
- Focus on demonstrating value proposition, not production scalability
- Some features are placeholder or simplified for demo purposes

**Production Considerations**:
- Publishing should be limited to demo/testing environments
- Not recommended for production use without refactoring
- Evaluate migration path from Lovable to standalone infrastructure
- Consider data persistence, security hardening, and scalability for production

## Technology Stack

### Frontend
- **React 18.3** + **TypeScript 5.8** + **Vite 5.4**
- **XYFlow 12.8** (formerly React Flow) - Visual node-based flow editor
- **shadcn-ui** (50+ Radix UI components) + **Tailwind CSS 3.4**
- **React Hook Form 7.6** + **Zod 3.25** - Form validation
- **TanStack Query 5.8** - Data fetching (minimal usage currently)

### Backend
- **Supabase** - PostgreSQL database, auth, edge functions
- **Deno** - Serverless edge function runtime
- **Lovable AI Gateway** - Gemini 2.5 Flash model access

### External Integrations
- **HubSpot** - CRM integration for lead data (via webhook)
- **Lovable Platform** - Deployment and development platform

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:8080)
npm run dev

# Build for production
npm run build

# Build in development mode (non-minified)
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Core Architecture

### Component Hierarchy

```
App.tsx (providers, routing)
└── Index.tsx
    └── BotBuilder.tsx (orchestrator - manages blocks[] and messages[])
        ├── TopNavigation.tsx (header with Publish/Test buttons)
        ├── Canvas.tsx (XYFlow wrapper)
        │   └── CustomNode.tsx (XYFlow node adapter)
        │       └── BlockNode.tsx (renders individual blocks + forms)
        │           ├── QuestionForm.tsx
        │           ├── MessageForm.tsx
        │           ├── HubSpotToggle.tsx
        │           └── ... (form components)
        ├── ChatPanel.tsx (AI copilot interface)
        │   └── ChatMessage.tsx (renders messages + inline forms)
        ├── FloatingAddButton.tsx (quick add block button)
        └── BotPreviewModal.tsx (test bot flow)
```

### State Management

**All state lives in BotBuilder.tsx** - no Redux/Context:
- `blocks: Block[]` - Array of flow blocks with position, type, config, status
- `messages: ChatMessage[]` - Conversation history with AI
- `selectedBlock: Block | null` - Currently editing block
- `isPreviewOpen: boolean` - Modal states

State flows down via props; updates flow up via callbacks (`addBlock`, `updateBlock`, `removeBlock`).

### Data Flow: Chat → AI → Canvas Updates

```
User types in ChatPanel
    ↓
handleSend() → supabase.functions.invoke("chat-ai", {messages, blocks})
    ↓
Deno Edge Function (supabase/functions/chat-ai/index.ts)
    ├─ Formats system prompt with current bot structure
    ├─ Calls Lovable AI Gateway (Gemini 2.5 Flash)
    └─ Returns {message: string, tool_calls: AIAction[]}
    ↓
handleAIResponse() processes tool_calls:
    ├─ add_block → BotBuilder.addBlock() → triggers autoLayoutBlocks()
    ├─ update_block → BotBuilder.updateBlock()
    ├─ remove_block → BotBuilder.removeBlock()
    └─ show_form → Opens BlockNode form modal
    ↓
React re-renders Canvas with updated blocks[] state
```

### Block Types & Lifecycle

**Block Types**:
- `start` - Entry point (immutable, always present)
- `send-message` - Display message to user
- `ask-question` - Collect user input into variable
- `hubspot` - Send collected data to HubSpot CRM
- `end` - Exit point (immutable, always present)

**Block Status**:
- `pending` - Needs configuration (form not filled)
- `ready` - Fully configured and active

**Block Interface** (`src/types/botBuilder.ts`):
```typescript
interface Block {
  id: string;                    // e.g., "start", "q1", "msg2"
  type: BlockType;
  position: { x: number; y: number };
  status: "pending" | "ready";
  config?: {
    message?: string;            // send-message
    question?: string;           // ask-question
    variableName?: string;       // ask-question field name
    // ... block-specific config
  };
}
```

### AI Action Protocol

The AI returns structured JSON actions that the frontend interprets:

```typescript
type AIAction =
  | { type: "add_block"; blockType: BlockType; config?: any; position?: {...} }
  | { type: "show_form"; blockId: string }
  | { type: "update_block"; blockId: string; config: any; showForm?: boolean }
  | { type: "remove_block"; blockIds: string[] }
```

**Critical**: The edge function (`chat-ai/index.ts`) contains the AI system prompt that defines:
- Block type descriptions and capabilities
- Pre-filling logic (always suggest config values based on user intent)
- Field naming conventions (snake_case: `first_name`, `email_address`)
- Position insertion logic (`afterBlockId`, `beforeBlockId`)

### Auto-Layout Algorithm

**Location**: `BotBuilder.tsx` - `autoLayoutBlocks()`

**Logic**:
```typescript
const BLOCKS_PER_ROW = 3;
const START_X = 100, START_Y = 100;
const HORIZONTAL_SPACING = 280, VERTICAL_SPACING = 180;

// Calculate position for each block
const row = Math.floor(index / BLOCKS_PER_ROW);
const col = index % BLOCKS_PER_ROW;
x = START_X + col * HORIZONTAL_SPACING;
y = START_Y + row * VERTICAL_SPACING;
```

**Trigger**: Called after `addBlock()`, `removeBlock()`, and on initial load.

**User Override**: Users can drag blocks manually; positions are synced back to state via `onNodesChange()`.

## Environment Configuration

### Required Environment Variables (`.env`)

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="uhroprjrrcknrtsrecll"
VITE_SUPABASE_URL="https://uhroprjrrcknrtsrecll.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..." # Anon public key
```

### Supabase Edge Function Secrets

Set via Supabase CLI:
```bash
supabase secrets set LOVABLE_API_KEY=<your-key>
```

**Required for AI chat**: Without `LOVABLE_API_KEY`, the AI copilot will not function.

## Key Files & Responsibilities

### Frontend Core
- **`src/components/BotBuilder.tsx`** (500+ lines) - State orchestrator, block CRUD, auto-layout
- **`src/components/Canvas.tsx`** (200+ lines) - XYFlow setup, drag handling, node rendering
- **`src/components/ChatPanel.tsx`** (400+ lines) - AI chat UI, message filtering, action processing
- **`src/components/BlockNode.tsx`** (300+ lines) - Block visualization, form modal triggers
- **`src/types/botBuilder.ts`** - TypeScript interfaces for Block, ChatMessage, AIAction

### Forms (Block Configuration)
- **`src/components/forms/QuestionForm.tsx`** - ask-question block (question text, variable name)
- **`src/components/forms/MessageForm.tsx`** - send-message block (message content)
- **`src/components/forms/HubSpotToggle.tsx`** - HubSpot integration toggle

### Backend
- **`supabase/functions/chat-ai/index.ts`** (25KB) - AI system prompt, Lovable AI Gateway integration
- **`supabase/config.toml`** - Edge function configuration (`verify_jwt = false` for public access)

### Configuration
- **`vite.config.ts`** - Vite settings, path aliases (`@` → `./src`)
- **`tailwind.config.ts`** - Custom HSL color system, dark mode class-based
- **`components.json`** - shadcn-ui configuration (component aliases)

## Common Development Patterns

### Adding a New Block Type

1. **Update TypeScript types** (`src/types/botBuilder.ts`):
   ```typescript
   export type BlockType = "start" | "end" | "send-message" | "ask-question" | "hubspot" | "your-new-type";
   ```

2. **Create form component** (`src/components/forms/YourNewForm.tsx`):
   - Use React Hook Form + Zod validation
   - Follow existing form patterns (QuestionForm, MessageForm)

3. **Add form to BlockNode** (`src/components/BlockNode.tsx`):
   ```typescript
   {block.type === "your-new-type" && selectedBlock?.id === block.id && (
     <YourNewForm block={block} onSave={handleSaveBlock} onCancel={onCancelEdit} />
   )}
   ```

4. **Update AI system prompt** (`supabase/functions/chat-ai/index.ts`):
   - Add block type to `=== BLOCK TYPES ===` section
   - Add configuration examples to `=== PRE-FILLING BLOCK CONFIGURATIONS ===`

5. **Test**: Restart dev server, ask AI to "add a [your-new-type] block"

### Modifying AI Behavior

**All AI logic lives in**: `supabase/functions/chat-ai/index.ts`

**Key sections**:
- **System prompt** (lines 40-200+) - Defines AI personality, block types, configuration rules
- **Tool definitions** (lines 200-400+) - JSON schema for AI actions
- **Response parsing** - Extracts `tool_calls` from Gemini response

**Deploy changes**:
```bash
# Requires Supabase CLI installed
supabase functions deploy chat-ai
```

### Debugging AI Actions

**Frontend logging**: Check browser console for:
```
Processing AI action: {type: "add_block", blockType: "ask-question", ...}
```

**Backend logging**: Check Supabase Functions logs (in Supabase Dashboard) for:
```
=== Chat AI Request ===
Messages count: 5
Blocks state: {...}
Pending blocks: hubspot(hubspot1)
```

## Important Architectural Decisions

### Why XYFlow Instead of Custom Canvas?
- Pre-built drag-drop, zoom, pan functionality
- Handles edge routing, node connections automatically
- Active ecosystem, good TypeScript support
- Faster development than building from scratch

### Why No Redux/Context?
- Current component tree depth is shallow (max 4 levels)
- BotBuilder as single source of truth is sufficient
- Props drilling is explicit and traceable
- Can migrate to Context later if needed

### Why Deno for Edge Functions?
- Supabase uses Deno runtime for all edge functions
- No node_modules in serverless environment
- Secure by default (explicit permissions)
- TypeScript native support

### Why Message Filtering in ChatPanel?
**Problem**: Internal form submissions were sent back to AI, causing infinite loops.

**Solution**: Filter messages before sending to AI:
```typescript
const messagesToSend = messages.filter(
  (msg) => msg.role === "user" || msg.role === "assistant"
);
```

Excludes messages with `component` field (inline forms).

### Why Auto-Layout After Every Block Change?
**Problem**: Adding/removing blocks left gaps or overlaps.

**Solution**: Re-calculate all positions in grid layout after modifications.

**Trade-off**: User manual positioning is lost on add/remove (acceptable for MVP).

## Testing the Application

### Manual Testing Workflow

1. **Start dev server**: `npm run dev` → Open http://localhost:8080
2. **Initial state**: Bot loads with 10 pre-configured blocks (real estate use case)
3. **Test AI interactions**:
   - "Add a question asking for phone number" → Should create block with suggested config
   - "Remove the budget question" → Should delete block and re-layout
   - "Change welcome message to 'Hello!'" → Should open form with pre-filled text
4. **Test manual editing**:
   - Click "Configure" on pending blocks → Opens form modal
   - Fill form, click Save → Block status changes to "ready"
5. **Test visual editing**:
   - Drag blocks on canvas → Position updates in state
   - Should maintain connections (sequential flow)
6. **Test bot preview**:
   - Click "Test Bot" → Opens BotPreviewModal
   - Should show sequential flow of messages/questions

### Common Issues

**AI not responding**:
- Check `LOVABLE_API_KEY` is set in Supabase secrets
- Check browser console for CORS errors
- Verify edge function is deployed: `supabase functions list`

**Blocks not appearing**:
- Check `autoLayoutBlocks()` is called after state update
- Verify `blocks` array in React DevTools
- Check XYFlow `nodes` array matches `blocks`

**Forms not saving**:
- Verify `onSave` callback is connected to `updateBlock()`
- Check Zod schema validation errors in console
- Ensure `config` object structure matches block type expectations

## Lovable Platform Integration

This project is deployed via Lovable (lovable.dev):

**Project URL**: https://lovable.dev/projects/4d85251a-6a97-43f4-8a6f-70371a821fc5

### Development Workflows

**1. Lovable Web Editor (Recommended for POC)**:
- Navigate to project URL above
- Use natural language prompts to modify the application
- Changes are auto-committed to this Git repository
- Instant preview available in Lovable UI

**2. Local Development**:
```bash
git clone <repo-url>
cd <project-folder>
npm install
npm run dev
```
- Make changes in your preferred IDE
- Push changes to trigger Lovable sync
- View changes in Lovable project

**3. GitHub Codespaces**:
- Click "Code" → "Codespaces" → "New codespace"
- Full VS Code environment in browser
- Changes sync back to Lovable

### Publishing Options

**For POC/Demo Purposes**:
- **Quick Publish**: Lovable web UI → Share → Publish
  - Generates public URL: `https://<project-name>.lovable.app`
  - Suitable for demos, user testing, stakeholder reviews
  - Free tier available

**Custom Domain** (Optional):
- Navigate to: Project > Settings > Domains
- Click "Connect Domain"
- Follow DNS configuration steps
- See: [Lovable Custom Domain Docs](https://docs.lovable.dev/features/custom-domain#custom-domain)

**⚠️ Publishing Recommendations**:
- Use published URLs for internal testing and feedback gathering only
- Add password protection for sensitive demos (available in Lovable settings)
- Monitor usage analytics to validate POC hypotheses
- Do NOT publish to production environments without security review

## Code Style Conventions

### TypeScript
- Strict mode enabled (`tsconfig.json`)
- Explicit return types for exported functions
- Interface over type alias for object shapes
- Use `type` for unions/intersections

### React Components
- Functional components only (no class components)
- Custom hooks for reusable logic (see `src/hooks/`)
- Props interfaces named `{ComponentName}Props`
- Default exports for page components, named exports for utilities

### CSS/Tailwind
- Utility-first approach (minimal custom CSS)
- Use `cn()` helper from `lib/utils.ts` for conditional classes
- HSL color system: `hsl(var(--primary))`, `hsl(var(--accent))`
- Dark mode via `dark:` prefix (class-based strategy)

### File Naming
- Components: PascalCase (`BotBuilder.tsx`, `ChatPanel.tsx`)
- Utilities: camelCase (`utils.ts`, `use-toast.ts`)
- Types: camelCase (`botBuilder.ts`)
- Hooks: kebab-case with `use-` prefix (`use-mobile.tsx`)

## Common Gotchas

1. **XYFlow requires unique node IDs**: Block IDs must be globally unique, not just per type
2. **Auto-layout overwrites manual positioning**: If user drags blocks, they reset on next add/remove
3. **Message filtering is critical**: Forgetting to filter messages causes AI confusion/loops
4. **Block status vs configuration**: `status: "pending"` doesn't prevent block execution, it's UI-only
5. **Supabase environment variables must have `VITE_` prefix**: Otherwise Vite won't expose them to client
6. **Edge function changes require redeployment**: Local changes to `chat-ai/index.ts` need `supabase functions deploy`

## Performance Considerations

- **XYFlow renders all nodes**: No virtualization; performance degrades with 100+ blocks (unlikely for chatbots)
- **AI requests are sequential**: No parallel tool calls; each action waits for previous completion
- **Message history grows unbounded**: Consider truncating old messages for long sessions (not implemented)
- **Auto-layout runs on every add/remove**: O(n) complexity acceptable for <100 blocks

## Future Architecture Improvements

Based on current limitations:

1. **State Management**: Consider Zustand/Jotai if component tree deepens beyond 5 levels
2. **Undo/Redo**: Implement command pattern for block operations
3. **Block Validation**: Add pre-save validation before status changes to "ready"
4. **Multi-path Flows**: Support conditional branching (currently linear only)
5. **Real-time Collaboration**: Leverage Supabase Realtime for multi-user editing
6. **Block Library**: Create reusable block templates (e.g., "Lead Capture Flow")
