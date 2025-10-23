# Implementación: "See in Action" Button Feature

Esta documentación detalla cómo implementar la funcionalidad del botón "See in Action" que aparece en el chat cuando el usuario completa la configuración de HubSpot por primera vez.

## 📋 Descripción General

El botón "See in Action" aparece automáticamente en la conversación del chat copilot cuando:
1. El usuario configura el bloque de HubSpot (cambia el toggle a ON)
2. Es la primera vez que completa esta acción (solo aparece una vez)
3. Muestra una tarjeta minimal con un botón para previsualizar el bot

## 🎯 Archivos a Crear/Modificar

### 1. Crear: `src/components/FlowCompleteChatCard.tsx`

**Archivo nuevo** - Componente minimal que muestra el botón en el chat.

```tsx
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

### 2. Modificar: `src/components/BotBuilder.tsx`

#### Paso 2.1: Agregar estado para tracking

Busca la sección de `useState` (alrededor de las líneas 13-19) y agrega:

```tsx
const [hasSeenFlowComplete, setHasSeenFlowComplete] = useState(false);
```

Debe quedar así:
```tsx
const [blocks, setBlocks] = useState<Block[]>([]);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [selectedUseCase, setSelectedUseCase] = useState("");
const [isPreviewOpen, setIsPreviewOpen] = useState(false);
const [activeBlockFormId, setActiveBlockFormId] = useState<string | null>(null);
const [hasSeenFlowComplete, setHasSeenFlowComplete] = useState(false); // 👈 NUEVO
const { toast } = useToast();
```

#### Paso 2.2: Agregar efecto para detectar HubSpot configurado

Inmediatamente después del estado (antes del primer `useEffect` existente), agrega:

```tsx
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
```

#### Paso 2.3: Pasar prop a ChatPanel

Busca donde se renderiza el componente `<ChatPanel>` (alrededor de la línea 385-392) y agrega la prop `onOpenPreview`:

**ANTES:**
```tsx
<ChatPanel
  messages={messages}
  onAddMessage={addMessage}
  onRemoveMessage={removeMessage}
  onAddBlock={addBlock}
  onRemoveBlock={removeBlock}
  onUpdateBlock={updateBlock}
  blocks={blocks}
  onRequestBlockConfig={handleRequestBlockConfig}
/>
```

**DESPUÉS:**
```tsx
<ChatPanel
  messages={messages}
  onAddMessage={addMessage}
  onRemoveMessage={removeMessage}
  onAddBlock={addBlock}
  onRemoveBlock={removeBlock}
  onUpdateBlock={updateBlock}
  blocks={blocks}
  onRequestBlockConfig={handleRequestBlockConfig}
  onOpenPreview={() => setIsPreviewOpen(true)}  // 👈 NUEVO
/>
```

---

### 3. Modificar: `src/components/ChatPanel.tsx`

#### Paso 3.1: Agregar prop al interface

Busca la interfaz `ChatPanelProps` (alrededor de la línea 11-23) y agrega:

```tsx
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
  onOpenPreview?: () => void;  // 👈 NUEVO
}
```

#### Paso 3.2: Extraer la prop en el componente

Busca la desestructuración de props (alrededor de la línea 27-36) y agrega `onOpenPreview`:

**ANTES:**
```tsx
export const ChatPanel = ({
  messages,
  onAddMessage,
  onRemoveMessage,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
  blocks,
  onRequestBlockConfig,
}: ChatPanelProps) => {
```

**DESPUÉS:**
```tsx
export const ChatPanel = ({
  messages,
  onAddMessage,
  onRemoveMessage,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
  blocks,
  onRequestBlockConfig,
  onOpenPreview,  // 👈 NUEVO
}: ChatPanelProps) => {
```

#### Paso 3.3: Pasar prop a ChatMessageComponent

Busca donde se renderiza `<ChatMessageComponent>` (alrededor de la línea 329-337) y agrega la prop:

**ANTES:**
```tsx
<ChatMessageComponent
  key={message.id}
  message={message}
  onUpdateBlock={handleUpdateBlock}
  blocks={blocks}
/>
```

**DESPUÉS:**
```tsx
<ChatMessageComponent
  key={message.id}
  message={message}
  onUpdateBlock={handleUpdateBlock}
  blocks={blocks}
  onOpenPreview={onOpenPreview}  // 👈 NUEVO
/>
```

---

### 4. Modificar: `src/components/ChatMessage.tsx`

#### Paso 4.1: Agregar import

Al inicio del archivo, agrega el import del nuevo componente:

**ANTES:**
```tsx
import { ChatMessage, Block } from "@/types/botBuilder";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { HubSpotToggle } from "./forms/HubSpotToggle";
import { QuestionForm } from "./forms/QuestionForm";
import { MessageForm } from "./forms/MessageForm";
import { ActionSummary } from "./ActionSummary";
```

**DESPUÉS:**
```tsx
import { ChatMessage, Block } from "@/types/botBuilder";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { HubSpotToggle } from "./forms/HubSpotToggle";
import { QuestionForm } from "./forms/QuestionForm";
import { MessageForm } from "./forms/MessageForm";
import { ActionSummary } from "./ActionSummary";
import { FlowCompleteChatCard } from "./FlowCompleteChatCard";  // 👈 NUEVO
```

#### Paso 4.2: Agregar prop al interface

Busca la interfaz `ChatMessageComponentProps` (alrededor de la línea 10-14) y agrega:

```tsx
interface ChatMessageComponentProps {
  message: ChatMessage;
  onUpdateBlock: (id: string, updates: Partial<Block>) => void;
  blocks: Block[];
  onOpenPreview?: () => void;  // 👈 NUEVO
}
```

#### Paso 4.3: Extraer la prop en el componente

Busca la función del componente (alrededor de la línea 44-48) y agrega `onOpenPreview`:

**ANTES:**
```tsx
export const ChatMessageComponent = ({
  message,
  onUpdateBlock,
  blocks,
}: ChatMessageComponentProps) => {
```

**DESPUÉS:**
```tsx
export const ChatMessageComponent = ({
  message,
  onUpdateBlock,
  blocks,
  onOpenPreview,  // 👈 NUEVO
}: ChatMessageComponentProps) => {
```

#### Paso 4.4: Agregar lógica de detección y renderizado

Después de las declaraciones de variables iniciales (alrededor de la línea 49-55), agrega:

```tsx
const isSystem = message.role === "system";
const isAssistant = message.role === "assistant";

// Check if this is the flow complete celebration  // 👈 NUEVO
const isFlowCompleteCelebration = message.content === "FLOW_COMPLETE_CELEBRATION";

// Check if this is a structured summary message
const isSummary = isAssistant &&
  message.content.includes('**What I understood:**') &&
  message.content.includes('**Actions taken:**');

// Forms are now shown on canvas only, not in chat

// Render Flow Complete Celebration Card  // 👈 NUEVO - Todo este bloque
if (isFlowCompleteCelebration && onOpenPreview) {
  return (
    <div className="flex gap-2 items-start justify-start">
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="max-w-[80%]">
        <FlowCompleteChatCard onSeeInAction={onOpenPreview} />
      </div>
    </div>
  );
}

if (isSystem) {
  // ... resto del código existente
```

---

### 5. Modificar: `src/index.css`

Al final del archivo, agrega la animación fade-in:

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

## 🎨 Resultado Visual

Una vez implementado, cuando el usuario configure HubSpot, verá en el chat:

```
┌─────────────────────────────────┐
│ 🤖 Bot                          │
│ ┌─────────────────────────────┐ │
│ │ Your bot is ready! Want to  │ │
│ │ see how it works?           │ │
│ │                             │ │
│ │  [▶ See in Action]          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 🔍 Flujo de Funcionamiento

1. **Usuario abre HubSpot toggle** → Cambia el estado del bloque a "ready" con `config.connected = true`

2. **BotBuilder detecta el cambio** → El `useEffect` detecta que `isHubSpotConfigured` es `true`

3. **Se agrega mensaje especial** → Agrega un mensaje con content `"FLOW_COMPLETE_CELEBRATION"`

4. **ChatMessage detecta el marker** → Renderiza `FlowCompleteChatCard` en lugar de un mensaje normal

5. **Usuario hace click en el botón** → Se ejecuta `onOpenPreview()` → Abre `BotPreviewModal`

---

## ✅ Checklist de Implementación

Para implementar en Lovable, sigue este orden:

- [ ] 1. Crear el archivo `FlowCompleteChatCard.tsx`
- [ ] 2. Modificar `BotBuilder.tsx`:
  - [ ] Agregar estado `hasSeenFlowComplete`
  - [ ] Agregar `useEffect` de detección
  - [ ] Pasar prop `onOpenPreview` a ChatPanel
- [ ] 3. Modificar `ChatPanel.tsx`:
  - [ ] Agregar prop `onOpenPreview` al interface
  - [ ] Extraer prop en el componente
  - [ ] Pasar prop a ChatMessageComponent
- [ ] 4. Modificar `ChatMessage.tsx`:
  - [ ] Agregar import de `FlowCompleteChatCard`
  - [ ] Agregar prop `onOpenPreview` al interface
  - [ ] Extraer prop en el componente
  - [ ] Agregar detección y renderizado del celebration card
- [ ] 5. Modificar `index.css`:
  - [ ] Agregar animación `fade-in`

---

## 🧪 Cómo Probar

1. Asegúrate de que el bot tiene un bloque HubSpot en estado "pending"
2. Abre la aplicación
3. Click en el bloque HubSpot en el canvas
4. Activa el toggle "Connect to HubSpot"
5. **Resultado esperado**: En el chat debe aparecer la tarjeta con el botón "See in Action"
6. Click en el botón → Debe abrir el modal de preview del bot

---

## 💡 Notas Importantes

- **Solo aparece una vez**: El estado `hasSeenFlowComplete` asegura que solo se muestre la primera vez
- **Diseño minimal**: Intencionalmente simple para no sobrecargar la UI
- **Marker especial**: El contenido `"FLOW_COMPLETE_CELEBRATION"` es un identificador único que no se muestra al usuario
- **Responsivo**: Funciona en dark mode y diferentes tamaños de pantalla

---

## 🐛 Troubleshooting

**El botón no aparece:**
- Verifica que el bloque HubSpot esté en estado "ready"
- Verifica que `config.connected` sea `true`
- Revisa que el `useEffect` en BotBuilder se esté ejecutando

**El botón aparece múltiples veces:**
- Asegúrate de que `hasSeenFlowComplete` se esté actualizando correctamente

**El botón no hace nada al clickearlo:**
- Verifica que la prop `onOpenPreview` se esté pasando correctamente a través de todos los componentes
- Revisa que `setIsPreviewOpen(true)` se esté ejecutando en BotBuilder

---

## 📝 Código de Referencia Completo

Todos los archivos modificados están disponibles en el commit de esta implementación. Puedes consultar:

- `src/components/FlowCompleteChatCard.tsx` - Componente nuevo
- `src/components/BotBuilder.tsx` - Lógica de detección
- `src/components/ChatPanel.tsx` - Paso de props
- `src/components/ChatMessage.tsx` - Renderizado condicional
- `src/index.css` - Animaciones

---

**Última actualización**: 2025-10-21
**Versión**: 1.0 - Implementación minimal
