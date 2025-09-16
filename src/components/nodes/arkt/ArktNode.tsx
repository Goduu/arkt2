import { Handle, NodeResizer, Position } from '@xyflow/react';
import { NodeProps } from '@xyflow/system';
import { ArktNode } from './types';
import { cn } from '../../utils';
import { useRef, useState } from 'react';
import { useRedrawSketch } from '../../sketchy/hooks/useRedrawSketch';
import SketchyShape from '../../sketchy/SketchyShape';
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from '../../colors/constants';
import { useRotationHandler } from '../useRotationHandler';
import AutoResizeTextarea from './auto-resize-textarea';
import { useNodeControls } from './useNodeControls';
import useUserDataStateSynced from '../../yjs/useUserStateSynced';

export const ArktNodeComponent = ({ id, selected, width, height, data }: NodeProps<ArktNode>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: width ?? 180, height: height ?? 80 });
  const { rotateControlRef, rotation } = useRotationHandler(id, selected);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { currentUserData, usersData, onDiagramDrillDown } = useUserDataStateSynced();

  const { onLabelChange } = useNodeControls(id);

  useRedrawSketch({ containerRef, setSize });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // if cmd/ctr is pressed, drilldown to the node
    if (event.ctrlKey || event.metaKey) {
      onDiagramDrillDown(id, data.label);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-md",
        "group min-w-32 w-full h-full relative overflow-visible",
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
      onClick={handleClick}
      data-testid={`arch-node`}
      data-selected={selected ? "true" : "false"}
      onDoubleClick={() => setIsEditing(true)}
    >
      <SketchyShape
        className="absolute inset-0 pointer-events-none"
        width={size.width ?? 180}
        height={size.height ?? 80}
        kind={"rectangle"}
        fillColor={DEFAULT_FILL_COLOR}
        strokeColor={DEFAULT_STROKE_COLOR}
        strokeWidth={2}
        roughness={1.7}
        fillStyle={"hachure"}
        seed={1}
      />
      {isEditing ? (
        <AutoResizeTextarea
          nodeId={id}
          value={data.label}
          onChange={onLabelChange}
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        <div className={cn("w-full h-full text-sm px-3 py-2 font-medium whitespace-pre-wrap break-words select-none")}
        >
          {data.label}
        </div>
      )}
      <div ref={rotateControlRef} />
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={30}
        minHeight={30}
      />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
}
