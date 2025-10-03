import { Handle, NodeResizer, Position, useReactFlow } from '@xyflow/react';
import { NodeProps } from '@xyflow/system';
import { ArktNode } from './types';
import { cn } from '../../utils';
import { MouseEvent, useRef, useState } from 'react';
import { useRedrawSketch } from '../../sketchy/hooks/useRedrawSketch';
import SketchyShape from '../../sketchy/SketchyShape';
import { useRotationHandler } from '../useRotationHandler';
import AutoResizeTextarea from './auto-resize-textarea';
import { useArktNodeControls } from './useArktNodeControls';
import useUserDataStateSynced from '../../yjs/useUserStateSynced';
import { getTailwindTextClass } from '@/components/colors/utils';
import { useTheme } from 'next-themes';
import { TemplateIcon } from '@/components/templates/TemplateIcon';
import { useNodeData } from './useNodeData';
import { VirtualLinkIndicator } from './virtual/VirtualLinkIndicator';

export const ArktNodeComponent = ({ id, selected, width, height, data }: NodeProps<ArktNode>) => {
  if (selected) {
    console.log("selected", data);
  }
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: width ?? 180, height: height ?? 80 });
  const { rotateControlRef } = useRotationHandler(id, "arktNode", selected);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { fitView } = useReactFlow();
  const { onDiagramDrillDown, onDiagramDrillToNode, currentUserData } = useUserDataStateSynced(fitView);
  const { fillColor, strokeColor, rotation, iconKey, strokeLineDash, label } = useNodeData(data);
  const { theme } = useTheme();
  const textColorClass = getTailwindTextClass(strokeColor, theme)

  const isSelectedByCurrentUser = selected && data.selectedBy === currentUserData?.id;

  const { onNodeUpdate: onLabelChange } = useArktNodeControls(id);

  useRedrawSketch({ containerRef, setSize });

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    // if cmd/ctr is pressed, drilldown to the node
    if (event.altKey) {
      if (data.virtualOf) {
        onDiagramDrillToNode(data.virtualOf);
      }
      onDiagramDrillDown(id, label);
    }
  }

  return (
    <div
      ref={containerRef}
      data-testid="arktNode"
      className={cn(
        "rounded-xs group",
        "group w-full h-full relative overflow-visible",
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
      onClick={handleClick}
      data-selected={isSelectedByCurrentUser ? "true" : "false"}
      onDoubleClick={() => setIsEditing(true)}
    >
      <NodeResizer
        color="#ff0071"
        isVisible={isSelectedByCurrentUser}
        minWidth={30}
        minHeight={30}
      />

      <VirtualLinkIndicator nodeId={id} />

      <SketchyShape
        className="absolute inset-0 pointer-events-none"
        width={size.width}
        height={size.height}
        kind={"rectangle"}
        fillColor={fillColor}
        strokeColor={strokeColor}
        strokeLineDash={strokeLineDash}
        strokeWidth={2}
        roughness={1.7}
        fillStyle={"hachure"}
        seed={1}
      />
      {isEditing && isSelectedByCurrentUser ? (
        <AutoResizeTextarea
          data-testid='arkt-node-label-edit'
          nodeId={id}
          value={label}
          onChange={(next) => onLabelChange({ label: next })}
          onBlur={() => setIsEditing(false)}
          paddingClassName='py-1 z-20'
          className={cn(textColorClass)}
          style={{ fontSize: Number(data?.fontSize ?? 15) }}
        />
      ) : (
        <div
          data-testid="arkt-node-label"
          style={{ fontSize: Number(data?.fontSize ?? 15) }}
          className={cn(
            "absolute inset-0 w-full z-20 h-full text-sm px-3 py-3 font-medium whitespace-pre-wrap break-words select-none",
            textColorClass
          )}
        >
          {label}
        </div>
      )}

      {(iconKey) && (
        <TemplateIcon
          className="size-6 absolute -top-3 left-1/2 -translate-x-1/2"
          iconKey={iconKey}
          strokeColor={strokeColor}
          fillColor={fillColor}
        />
      )}

      <div ref={rotateControlRef} />

      <div className={(iconKey) && "-top-3 absolute left-1/2 -translate-x-1/2"}>
        <Handle type="source" position={Position.Top} id="top" className="opacity-100 group-hover:opacity-100 md:opacity-5" />
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-100 group-hover:opacity-100 md:opacity-5" />
      <Handle type="source" position={Position.Left} id="left" className="opacity-100 group-hover:opacity-100 md:opacity-5" />
      <Handle type="source" position={Position.Right} id="right" className="opacity-100 group-hover:opacity-100 md:opacity-5" />
    </div>
  );
}
