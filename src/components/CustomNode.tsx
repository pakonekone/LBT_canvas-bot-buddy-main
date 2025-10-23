import { Handle, Position } from '@xyflow/react';
import { BlockNode } from './BlockNode';
import { Block } from '@/types/botBuilder';

interface CustomNodeData {
  block: Block;
  onUpdateBlock?: (id: string, updates: Partial<Block>) => void;
  blocks: Block[];
  forceShowForm?: boolean;
  onFormClosed?: () => void;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

export const CustomNode = ({ data }: CustomNodeProps) => {
  return (
    <div className="relative">
      {data.block.type !== 'start' && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: 'hsl(var(--primary))', border: 'none' }}
        />
      )}
      <BlockNode
        block={data.block}
        onUpdateBlock={data.onUpdateBlock}
        blocks={data.blocks}
        forceShowForm={data.forceShowForm}
        onFormClosed={data.onFormClosed}
      />
      {data.block.type !== 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: 'hsl(var(--primary))', border: 'none' }}
        />
      )}
    </div>
  );
};
