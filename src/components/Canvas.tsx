import { Block } from "@/types/botBuilder";
import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  OnNodesChange,
  applyNodeChanges,
  NodeChange,
  Connection,
  ConnectionMode,
  OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  onUpdateBlock?: (id: string, updates: Partial<Block>) => void;
  activeBlockFormId?: string | null;
  onBlockFormClosed?: () => void;
}

const nodeTypes = {
  custom: CustomNode,
};

export const Canvas = ({ blocks, setBlocks, onUpdateBlock, activeBlockFormId, onBlockFormClosed }: CanvasProps) => {
  // Convert blocks to React Flow nodes
  const nodes: Node[] = useMemo(() => 
    blocks.map((block) => ({
      id: block.id,
      type: 'custom',
      position: block.position,
      data: { 
        block, 
        onUpdateBlock,
        blocks,
        forceShowForm: activeBlockFormId === block.id,
        onFormClosed: onBlockFormClosed,
      },
      draggable: block.type !== 'start',
    })),
    [blocks, onUpdateBlock, activeBlockFormId, onBlockFormClosed]
  );

  // Create edges connecting sequential blocks
  const edges: Edge[] = useMemo(() => 
    blocks.slice(0, -1).map((block, index) => ({
      id: `${block.id}-${blocks[index + 1].id}`,
      source: block.id,
      target: blocks[index + 1].id,
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: 'hsl(var(--arrow))',
        strokeWidth: 3,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: 'hsl(var(--arrow))',
        width: 12,
        height: 12,
      },
    })),
    [blocks]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const positionChanges = changes.filter(
        (change) => change.type === 'position' && change.position
      );

      if (positionChanges.length > 0) {
        setBlocks((prevBlocks) => {
          const updatedBlocks = [...prevBlocks];
          positionChanges.forEach((change: any) => {
            const blockIndex = updatedBlocks.findIndex((b) => b.id === change.id);
            if (blockIndex !== -1 && change.position) {
              updatedBlocks[blockIndex] = {
                ...updatedBlocks[blockIndex],
                position: change.position,
              };
            }
          });
          return updatedBlocks;
        });
      }
    },
    [setBlocks]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      // Prevent manual connections for now - blocks are connected sequentially
      console.log('Connection attempt:', connection);
    },
    []
  );

  return (
    <div className="flex-1 relative bg-canvas-bg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="hsl(var(--canvas-grid))" 
          gap={20} 
          size={1}
        />
        <Controls 
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};
