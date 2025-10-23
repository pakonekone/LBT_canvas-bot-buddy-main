# 🔄 Instrucciones Completas para Sincronizar Lovable

Este documento contiene **TODOS** los cambios realizados localmente que deben aplicarse en Lovable para sincronizar el proyecto.

---

## 📊 Resumen de Cambios

### Archivos Nuevos Creados (5):
1. ✨ `src/components/forms/AIAgentForm.tsx` - Formulario para configurar AI Agents
2. 🎉 `src/components/FlowCompleteChatCard.tsx` - Tarjeta "See in Action"
3. 🎉 `src/components/FlowCompleteCelebration.tsx` - Componente de celebración
4. 💬 `src/components/SuggestionChips.tsx` - Chips de sugerencias
5. 🎯 `src/hooks/useSuggestions.ts` - Hook para sugerencias
6. 🤖 `src/components/AICopilotWidget.tsx` - Widget de copiloto AI

### Archivos Modificados (7):
1. `src/types/botBuilder.ts` - Nuevo tipo `ai-agent` + interface `Suggestion`
2. `src/components/BlockNode.tsx` - Renderizado del AI Agent block
3. `src/components/ChatMessage.tsx` - Padding reducido + Flow Complete Card
4. `src/components/ChatPanel.tsx` - Espaciado reducido + sugerencias
5. `src/components/BotBuilder.tsx` - Lógica Flow Complete + sugerencias
6. `src/index.css` - Animación fade-in
7. `supabase/functions/chat-ai/index.ts` - AI Agent en system prompt (✅ YA APLICADO)

---

## 🎯 PARTE 1: Mejoras de UI/UX del Chat

### 1.1 Reducir Espaciado Entre Mensajes

**Archivo**: `src/components/ChatPanel.tsx`

**Cambio**: Línea ~277
```typescript
// ANTES:
<div className="space-y-4">

// DESPUÉS:
<div className="space-y-1">
```

**Razón**: Reducir espacio visual entre mensajes consecutivos (de 16px a 4px)

---

### 1.2 Reducir Padding de Burbujas de Mensajes

**Archivo**: `src/components/ChatMessage.tsx`

**Cambio**: Línea ~108
```typescript
// ANTES:
"rounded-lg p-3 text-sm",

// DESPUÉS:
"rounded-xl p-2 text-sm leading-relaxed",
```

**Razón**: Hacer las burbujas más compactas (de 12px a 8px padding)

---

### 1.3 Agregar Animación Fade-In

**Archivo**: `src/index.css`

**Agregar al final del archivo**:
```css
/* Custom animations */
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
```

---

## 🎉 PARTE 2: Feature "See in Action" (Flow Complete Celebration)

### 2.1 Crear FlowCompleteChatCard Component

**Archivo NUEVO**: `src/components/FlowCompleteChatCard.tsx`

```typescript
import { Button } from "./ui/button";
import { Play } from "lucide-react";

interface FlowCompleteChatCardProps {
  onSeeInAction: () => void;
}

export const FlowCompleteChatCard = ({ onSeeInAction }: FlowCompleteChatCardProps) => {
  return (
    <div className="rounded-lg p-3 bg-muted border border-border">
      <p className="text-sm text-foreground mb-3">
        Your bot is ready! Want to see how it works?
      </p>
      <Button
        onClick={onSeeInAction}
        variant="default"
        size="sm"
        className="w-full"
      >
        <Play className="h-4 w-4 mr-2" />
        See in Action
      </Button>
    </div>
  );
};
```

---

### 2.2 Modificar BotBuilder para Detectar Flow Complete

**Archivo**: `src/components/BotBuilder.tsx`

**Agregar estado** (después de los otros useState):
```typescript
const [hasSeenFlowComplete, setHasSeenFlowComplete] = useState(false);
```

**Agregar useEffect** (después del estado, antes del primer useEffect existente):
```typescript
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
          component: null,
        },
      ]);
    }, 500);
  }
}, [hasSeenFlowComplete, blocks]);
```

**Agregar prop a ChatPanel** (donde se renderiza <ChatPanel>):
```typescript
<ChatPanel
  messages={messages}
  onAddMessage={addMessage}
  onRemoveMessage={removeMessage}
  onAddBlock={addBlock}
  onRemoveBlock={removeBlock}
  onUpdateBlock={updateBlock}
  blocks={blocks}
  onRequestBlockConfig={handleRequestBlockConfig}
  onOpenPreview={() => setIsPreviewOpen(true)}  // 👈 AGREGAR ESTA LÍNEA
/>
```

---

### 2.3 Modificar ChatPanel para Pasar Prop

**Archivo**: `src/components/ChatPanel.tsx`

**Actualizar interface ChatPanelProps**:
```typescript
interface ChatPanelProps {
  messages: ChatMessage[];
  onAddMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  onRemoveMessage: (predicate: (msg: ChatMessage) => boolean) => void;
  onAddBlock: (
    type: Block["type"],
    config?: Record<string, any>,
    position?: { afterBlockId?: string; beforeBlockId?: string },
  ) => void;
  onRemoveBlock: (blockId: string) => void;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  blocks: Block[];
  onRequestBlockConfig: (blockId: string) => void;
  onOpenPreview?: () => void;  // 👈 AGREGAR
}
```

**Extraer prop en el componente**:
```typescript
export const ChatPanel = ({
  messages,
  onAddMessage,
  onRemoveMessage,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
  blocks,
  onRequestBlockConfig,
  onOpenPreview,  // 👈 AGREGAR
}: ChatPanelProps) => {
```

**Pasar prop a ChatMessageComponent** (donde se renderiza):
```typescript
<ChatMessageComponent
  key={message.id}
  message={message}
  onUpdateBlock={handleUpdateBlock}
  blocks={blocks}
  onOpenPreview={onOpenPreview}  // 👈 AGREGAR
/>
```

---

### 2.4 Modificar ChatMessage para Renderizar Card

**Archivo**: `src/components/ChatMessage.tsx`

**Agregar imports**:
```typescript
import { FlowCompleteChatCard } from "./FlowCompleteChatCard";
import { SuggestionChips } from "./SuggestionChips";
```

**Actualizar interface**:
```typescript
interface ChatMessageComponentProps {
  message: ChatMessage;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  blocks: Block[];
  onOpenPreview?: () => void;  // 👈 AGREGAR
  onSuggestionClick?: (prompt: string, messageId: string, chipId: string) => void;
}
```

**Extraer props**:
```typescript
export const ChatMessageComponent = ({
  message,
  onUpdateBlock,
  blocks,
  onOpenPreview,  // 👈 AGREGAR
  onSuggestionClick,
}: ChatMessageComponentProps) => {
```

**Agregar detección y renderizado** (después de las declaraciones de variables, antes del `if (isSystem)`):
```typescript
// Check if this is the flow complete celebration
const isFlowCompleteCelebration = message.content === "FLOW_COMPLETE_CELEBRATION";

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
```

---

## ✨ PARTE 3: Nuevo Bloque AI Agent

### 3.1 Actualizar TypeScript Types

**Archivo**: `src/types/botBuilder.ts`

**Cambio 1** - Agregar tipo ai-agent:
```typescript
export type BlockType =
  | "start"
  | "end"
  | "send-message"
  | "ask-question"
  | "hubspot"
  | "ai-agent";  // 👈 AGREGAR
```

**Cambio 2** - Agregar interface Suggestion (antes de ChatMessage):
```typescript
export interface Suggestion {
  id: string;
  emoji: string;
  text: string;
  prompt: string;
}
```

**Cambio 3** - Actualizar ChatMessage interface:
```typescript
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  component?: React.ReactNode;
  blockId?: string;
  suggestions?: Suggestion[];  // 👈 AGREGAR
}
```

---

### 3.2 Crear AIAgentForm Component

**Archivo NUEVO**: `src/components/forms/AIAgentForm.tsx`

```typescript
import { useState } from "react";
import { Block } from "@/types/botBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface AIAgentFormProps {
  blockId: string;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  existingConfig?: Record<string, any>;
}

interface Output {
  id: string;
  label: string;
}

export const AIAgentForm = ({ blockId, onUpdateBlock, existingConfig }: AIAgentFormProps) => {
  const [agentName, setAgentName] = useState(existingConfig?.agentName || "");
  const [agentPrompt, setAgentPrompt] = useState(existingConfig?.agentPrompt || "");
  const [outputs, setOutputs] = useState<Output[]>(
    existingConfig?.outputs || [
      { id: "output1", label: "Output 1" },
      { id: "output2", label: "Output 2" }
    ]
  );

  const handleAddOutput = () => {
    const newId = `output${outputs.length + 1}`;
    setOutputs([...outputs, { id: newId, label: `Output ${outputs.length + 1}` }]);
  };

  const handleRemoveOutput = (id: string) => {
    if (outputs.length > 1) {
      setOutputs(outputs.filter(o => o.id !== id));
    }
  };

  const handleOutputLabelChange = (id: string, newLabel: string) => {
    setOutputs(outputs.map(o => o.id === id ? { ...o, label: newLabel } : o));
  };

  const handleSubmit = () => {
    if (!agentName.trim() || !agentPrompt.trim()) return;

    onUpdateBlock(blockId, {
      status: "ready",
      config: {
        agentName: agentName.trim(),
        agentPrompt: agentPrompt.trim(),
        outputs: outputs,
      },
    });
  };

  return (
    <Card className="p-4 bg-muted/50 border-primary/20">
      <div className="space-y-4">
        <div>
          <Label htmlFor="agentName" className="text-sm font-medium">
            Agent Name
          </Label>
          <Input
            id="agentName"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="e.g., Lead Scoring Agent, Sub Agent 03"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A descriptive name for this AI agent
          </p>
        </div>

        <div>
          <Label htmlFor="agentPrompt" className="text-sm font-medium">
            Agent Instructions
          </Label>
          <Textarea
            id="agentPrompt"
            value={agentPrompt}
            onChange={(e) => setAgentPrompt(e.target.value)}
            placeholder="Describe what this AI agent should do..."
            className="mt-1.5"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            The instructions and context for this AI agent
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Outputs (Conditional Paths)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOutput}
              className="h-7 px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Output
            </Button>
          </div>

          <div className="space-y-2">
            {outputs.map((output, index) => (
              <div key={output.id} className="flex gap-2 items-center">
                <Input
                  value={output.label}
                  onChange={(e) => handleOutputLabelChange(output.id, e.target.value)}
                  placeholder={`Output ${index + 1}`}
                  className="flex-1"
                />
                {outputs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOutput(output.id)}
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Each output represents a possible path the conversation can take based on the AI agent&apos;s decision
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-accent hover:bg-accent/90"
          disabled={!agentName.trim() || !agentPrompt.trim()}
        >
          Save AI Agent Configuration
        </Button>
      </div>
    </Card>
  );
};
```

---

### 3.3 Actualizar BlockNode para Renderizar AI Agent

**Archivo**: `src/components/BlockNode.tsx`

**Cambio 1** - Agregar import:
```typescript
import { AIAgentForm } from "./forms/AIAgentForm";
```

**Cambio 2** - Actualizar BLOCK_ICONS:
```typescript
const BLOCK_ICONS = {
  start: "🏁",
  end: "🏁",
  "send-message": "💬",
  "ask-question": "📝",
  hubspot: "👥",
  "ai-agent": "✨",  // 👈 AGREGAR
};
```

**Cambio 3** - Actualizar BLOCK_LABELS:
```typescript
const BLOCK_LABELS = {
  start: "Starting point",
  end: "End",
  "send-message": "Send Message",
  "ask-question": "Ask a question",
  hubspot: "HubSpot",
  "ai-agent": "AI Agent",  // 👈 AGREGAR
};
```

**Cambio 4** - Actualizar BLOCK_DESCRIPTIONS:
```typescript
const BLOCK_DESCRIPTIONS = {
  start: "Where your bot begins",
  end: "Conversation ends here",
  "send-message": "Send a message to the user",
  "ask-question": "Collect information from user",
  hubspot: "Save data to HubSpot",
  "ai-agent": "AI-powered decision making",  // 👈 AGREGAR
};
```

**Cambio 5** - Agregar renderizado especial del AI Agent (después del bloque `if (block.type === "start")` y antes del `return` principal):

```typescript
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
            {outputs.map((output: { id: string; label: string }) => (
              <div
                key={output.id}
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg px-3 py-2 flex items-center justify-between group hover:shadow-md transition-all"
              >
                <span className="text-sm font-medium">{output.label}</span>
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <div className="text-primary-foreground">→</div>
                </div>
              </div>
            ))}
          </div>

          {/* Connection dots */}
          <div className="absolute -left-2 top-[52px] w-3 h-3 bg-primary rounded-full border-2 border-canvas-bg"></div>
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
```

---

## ✅ VERIFICACIÓN

Después de aplicar todos los cambios en Lovable, verifica:

1. **Chat UI**: Los mensajes deben tener menos espacio entre ellos
2. **Burbujas**: Deben ser más compactas con menos padding
3. **Flow Complete**: Al configurar HubSpot debe aparecer botón "See in Action"
4. **AI Agent**: Debe poder crear bloques con: `"Add an AI agent for lead scoring"`
5. **Visual AI Agent**: El bloque debe mostrar outputs en rosa/magenta

---

## 🚀 PROMPT COMPLETO PARA LOVABLE

Copia y pega este prompt en Lovable para aplicar todos los cambios:

```
I need to apply multiple improvements to the Canvas Bot Builder project. Please implement all these changes:

## PART 1: UI/UX Chat Improvements

1. In `src/components/ChatPanel.tsx` line ~277, change `space-y-4` to `space-y-1` to reduce spacing between messages

2. In `src/components/ChatMessage.tsx` line ~108, change `"rounded-lg p-3 text-sm"` to `"rounded-xl p-2 text-sm leading-relaxed"` to make message bubbles more compact

3. In `src/index.css`, add these animations at the end:
```css
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
```

## PART 2: "See in Action" Feature

Create complete "Flow Complete Celebration" feature as documented in IMPLEMENTATION_SEE_IN_ACTION.md file. This includes:
- Creating FlowCompleteChatCard component
- Modifying BotBuilder to detect when HubSpot is configured
- Adding state and useEffect for flow completion tracking
- Passing onOpenPreview prop through ChatPanel to ChatMessage
- Rendering the celebration card when flow is complete

## PART 3: AI Agent Block Type

1. Update `src/types/botBuilder.ts`:
   - Add "ai-agent" to BlockType union
   - Add Suggestion interface
   - Add suggestions?: Suggestion[] to ChatMessage interface

2. Create new component `src/components/forms/AIAgentForm.tsx` with:
   - Agent name input
   - Agent instructions textarea
   - Dynamic outputs list (add/remove)
   - Configuration form for AI agent blocks

3. Update `src/components/BlockNode.tsx`:
   - Add AIAgentForm import
   - Add "ai-agent" to BLOCK_ICONS with "✨"
   - Add "ai-agent" to BLOCK_LABELS and BLOCK_DESCRIPTIONS
   - Add special rendering for ai-agent block with multiple outputs displayed as gradient buttons
   - Include form portal for configuration

The ai-agent block should display with a header showing the agent name and multiple output buttons in pink/magenta gradient with arrows.

Please implement all these changes comprehensively.
```

---

**Fecha de generación**: 2025-10-23
**Versión del documento**: 1.0
