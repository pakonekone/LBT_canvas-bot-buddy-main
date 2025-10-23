# Canvas Bot Builder

> An AI-powered visual chatbot builder that turns natural language into conversational flows

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-blue)](https://lovable.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)](https://vitejs.dev/)

## 🎯 Project Status: Proof of Concept

**This is a POC built for rapid validation and user feedback gathering.**

The goal is to prove the concept of natural language-driven chatbot building before investing in a production-grade solution. Publishing is recommended for demo/testing purposes only.

## 🚀 What is Canvas Bot Builder?

Canvas Bot Builder reimagines how people create chatbots by combining:
- **Natural Language Interface**: Just describe what you want ("add a question asking for email")
- **Visual Flow Editor**: See your bot's conversation flow as a visual canvas (powered by XYFlow)
- **AI Copilot**: Gemini 2.5 Flash translates your intent into structured actions in real-time

### How It Works

```
You type: "Add a welcome message and ask for their name"
    ↓
AI interprets → Creates 2 blocks with pre-filled configurations
    ↓
Canvas updates instantly → You see the visual flow
    ↓
Review & edit → Click any block to fine-tune
    ↓
Test → Preview your bot's conversation
```

## ✨ Key Features

### 🤖 AI-Powered Building
- **Natural language commands** - No coding or complex UI required
- **Intelligent pre-filling** - AI suggests realistic configurations based on context
- **Contextual awareness** - Understands your bot's purpose (e.g., real estate lead capture)

### 🎨 Visual Canvas
- **Drag-and-drop editing** - Manually adjust block positions
- **Sequential flow visualization** - See conversation paths clearly
- **Auto-layout algorithm** - Keeps your canvas organized

### 🧩 Block Types
- **Start/End** - Entry and exit points (immutable)
- **Send Message** - Display text to users
- **Ask Question** - Collect user input into variables
- **HubSpot Integration** - Send collected data to CRM

### 🎯 Smart Forms
- **React Hook Form + Zod validation** - Type-safe configuration
- **Context-aware suggestions** - AI pre-fills based on your description
- **Real-time preview** - Test your bot before publishing

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- React 18.3 + TypeScript 5.8
- Vite (fast HMR and builds)
- XYFlow (visual flow editor)
- shadcn-ui + Tailwind CSS (UI components)
- React Hook Form + Zod (forms and validation)

**Backend**:
- Supabase (PostgreSQL database + edge functions)
- Deno (serverless runtime)
- Lovable AI Gateway → Gemini 2.5 Flash

**Integrations**:
- HubSpot (CRM webhooks)

### How the AI Works

1. You chat with the AI copilot in the right panel
2. Your message + current bot state → Sent to Supabase Edge Function
3. Edge function formats a system prompt with:
   - All current blocks and their configurations
   - Block type descriptions
   - Pre-filling rules (snake_case naming, context-aware suggestions)
4. Gemini 2.5 Flash processes the prompt → Returns structured JSON actions:
   ```json
   {
     "type": "add_block",
     "blockType": "ask-question",
     "config": {
       "question": "What is your email address?",
       "variableName": "email"
     }
   }
   ```
5. Frontend interprets actions → Updates canvas in real-time

### State Management

**Simple and explicit** - All state lives in `BotBuilder.tsx`:
- `blocks: Block[]` - Flow blocks with position, type, config, status
- `messages: ChatMessage[]` - Conversation history with AI
- `selectedBlock: Block | null` - Currently editing block

No Redux or Context - props flow down, callbacks flow up. Clean and traceable.

## 🛠️ Development

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd canvas-bot-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Available Commands

```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run build:dev    # Development build (non-minified)
npm run lint         # Lint code
npm run preview      # Preview production build
```

### Development Workflows

#### 1. Lovable Web Editor (Recommended for POC)
- Navigate to: https://lovable.dev/projects/4d85251a-6a97-43f4-8a6f-70371a821fc5
- Use natural language prompts to modify the app
- Changes auto-commit to this repository
- Instant preview in Lovable UI

#### 2. Local IDE Development
- Clone repo → Edit locally → Push changes
- Changes sync back to Lovable project
- Full control over code and git workflow

#### 3. GitHub Codespaces
- Click "Code" → "Codespaces" → "New codespace"
- Full VS Code environment in browser
- No local setup required

### Environment Setup

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

**Supabase Edge Function Secret** (required for AI):
```bash
supabase secrets set LOVABLE_API_KEY=<your-lovable-api-key>
```

Without the `LOVABLE_API_KEY`, the AI copilot will not function.

## 📦 Project Structure

```
src/
├── components/
│   ├── BotBuilder.tsx           # Main orchestrator (state management)
│   ├── Canvas.tsx                # XYFlow visual editor
│   ├── ChatPanel.tsx             # AI copilot interface
│   ├── BlockNode.tsx             # Individual block rendering
│   ├── forms/                    # Block configuration forms
│   │   ├── QuestionForm.tsx
│   │   ├── MessageForm.tsx
│   │   └── HubSpotToggle.tsx
│   └── ui/                       # 50+ shadcn-ui components
├── types/
│   └── botBuilder.ts             # TypeScript interfaces
├── integrations/
│   └── supabase/                 # Supabase client
└── lib/
    └── utils.ts                  # Utility functions

supabase/
├── config.toml                   # Supabase configuration
└── functions/
    └── chat-ai/
        └── index.ts              # AI system prompt + Gemini integration
```

## 🎨 Customization

### Adding a New Block Type

1. Update TypeScript types (`src/types/botBuilder.ts`)
2. Create form component (`src/components/forms/YourForm.tsx`)
3. Add form to `BlockNode.tsx`
4. Update AI system prompt (`supabase/functions/chat-ai/index.ts`)
5. Deploy edge function: `supabase functions deploy chat-ai`

### Modifying AI Behavior

All AI logic is in `supabase/functions/chat-ai/index.ts`:
- **System prompt** - Defines AI personality and rules
- **Tool definitions** - JSON schema for AI actions
- **Pre-filling logic** - How AI suggests configurations

Deploy changes: `supabase functions deploy chat-ai`

## 🧪 Testing

### Manual Testing Workflow

1. **Start dev server**: `npm run dev`
2. **Initial state**: Bot loads with 10 pre-configured blocks (real estate use case)
3. **Test AI interactions**:
   - "Add a question asking for phone number"
   - "Remove the budget question"
   - "Change welcome message to 'Hello!'"
4. **Test manual editing**: Click "Configure" on blocks → Fill forms → Save
5. **Test visual editing**: Drag blocks around canvas
6. **Test bot preview**: Click "Test Bot" → See conversation flow

### Common Issues

**AI not responding?**
- Check `LOVABLE_API_KEY` is set in Supabase secrets
- Check browser console for CORS errors
- Verify edge function deployment: `supabase functions list`

**Blocks not appearing?**
- Check `autoLayoutBlocks()` is called after state updates
- Verify `blocks` array in React DevTools

**Forms not saving?**
- Check Zod schema validation errors in console
- Verify `onSave` callback is connected properly

## 📤 Publishing (POC/Demo)

### Quick Publish via Lovable

1. Open Lovable project: https://lovable.dev/projects/4d85251a-6a97-43f4-8a6f-70371a821fc5
2. Click **Share** → **Publish**
3. Your app will be available at: `https://<project-name>.lovable.app`

### Custom Domain (Optional)

1. Navigate to: Project > Settings > Domains
2. Click "Connect Domain"
3. Follow DNS configuration steps
4. See: [Lovable Custom Domain Docs](https://docs.lovable.dev/features/custom-domain#custom-domain)

### ⚠️ Publishing Recommendations

- **Use for**: Internal demos, user testing, stakeholder reviews
- **Add password protection** for sensitive demos (available in Lovable settings)
- **Monitor analytics** to validate POC hypotheses
- **Do NOT use** for production environments without security review

## 🚧 POC Limitations

This is a proof of concept with some intentional simplifications:

### Current Limitations
- **Linear flows only** - No conditional branching or loops
- **No persistent storage** - Bot configurations not saved to database
- **Basic validation** - Limited error handling and edge case coverage
- **No undo/redo** - Block operations are not reversible
- **Auto-layout overwrites manual positioning** - Dragged blocks reset on add/remove
- **Unbounded message history** - Long sessions may impact performance

### Production Roadmap
If POC validates successfully, consider:
1. **Database integration** - Save/load bot configurations
2. **User authentication** - Multi-tenant support
3. **Conditional flows** - Branching logic based on user responses
4. **Block library** - Pre-built templates (e.g., "Lead Capture Flow")
5. **Real-time collaboration** - Multiple users editing same bot
6. **Analytics dashboard** - Track bot performance metrics
7. **Export options** - Generate code or integrate with external platforms

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive architecture guide for AI assistants
- **[Lovable Docs](https://docs.lovable.dev)** - Platform documentation
- **[XYFlow Docs](https://reactflow.dev)** - Visual flow editor documentation
- **[shadcn-ui](https://ui.shadcn.com)** - UI component library

## 🤝 Contributing

This is a POC project. Contributions should focus on:
- **Validating core concepts** - Does natural language bot building work?
- **User experience improvements** - Make the AI interaction more intuitive
- **Bug fixes** - Help stabilize the POC
- **Documentation** - Improve clarity for new users

For production features, wait until POC validates successfully.

## 📄 License

This project is part of a POC phase. License TBD based on production direction.

## 🔗 Links

- **Lovable Project**: https://lovable.dev/projects/4d85251a-6a97-43f4-8a6f-70371a821fc5
- **Supabase Dashboard**: Check your Supabase project for edge function logs and database
- **shadcn-ui Components**: https://ui.shadcn.com
- **XYFlow Documentation**: https://reactflow.dev

---

**Built with ❤️ using [Lovable](https://lovable.dev)** - The fastest way to build and ship web apps
