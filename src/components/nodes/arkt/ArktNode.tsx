import { Handle, NodeResizer, Position } from '@xyflow/react';
import { NodeProps } from '@xyflow/system';
import { ArktNode } from './types';
import { cn } from '../../utils';
import { MouseEvent, useMemo, useRef, useState } from 'react';
import { useRedrawSketch } from '../../sketchy/hooks/useRedrawSketch';
import SketchyShape from '../../sketchy/SketchyShape';
import { useRotationHandler } from '../useRotationHandler';
import AutoResizeTextarea from './auto-resize-textarea';
import { useNodeControls } from './useNodeControls';
import useUserDataStateSynced from '../../yjs/useUserStateSynced';
import { getTailwindTextClass } from '@/components/colors/utils';

export const ArktNodeComponent = ({ id, selected, width, height, data }: NodeProps<ArktNode>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: width ?? 180, height: height ?? 80 });
  const { rotateControlRef } = useRotationHandler(id, selected);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { onDiagramDrillDown } = useUserDataStateSynced();
  const { fillColor, strokeColor, rotation } = data;
  const textColorClass = useMemo(() => getTailwindTextClass(data.strokeColor), [data.strokeColor]);


  const { onNodeUpdate: onLabelChange } = useNodeControls(id);

  useRedrawSketch({ containerRef, setSize });

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
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
      {isEditing ? (
        <AutoResizeTextarea
          nodeId={id}
          value={data.label}
          onChange={(next) => onLabelChange({ label: next })}
          onBlur={() => setIsEditing(false)}
          className={cn('z-20 absolute inset-0', textColorClass)}
          style={{ fontSize: Number(data?.fontSize ?? 15) }}
        />
      ) : (
        <div
          style={{ fontSize: Number(data?.fontSize ?? 15) }}
          className={cn(
            "absolute inset-0 w-full z-20 h-full text-sm px-3 py-2 font-medium whitespace-pre-wrap break-words select-none",
            textColorClass
          )}
        >
          {data.label}
        </div>
      )}
      <SketchyShape
        className="absolute inset-0 pointer-events-none z-10"
        width={size.width ?? 180}
        height={size.height ?? 80}
        kind={"rectangle"}
        fillColor={fillColor}
        strokeColor={strokeColor}
        strokeWidth={2}
        roughness={1.7}
        fillStyle={"hachure"}
        seed={1}
      />

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
