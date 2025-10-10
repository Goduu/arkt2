"use client";

import * as React from "react";
import { Figma, Github } from "lucide-react";
import { IntegrationNode } from "./type";
import { NodeProps, Position } from "@xyflow/system";
import { Handle, NodeResizer } from "@xyflow/react";
import { useCommandStore } from "@/app/design/commandStore";
import { DEFAULT_STROKE_COLOR, getTailwindTextClass } from "@/components/colors/utils";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SketchyShape from "@/components/sketchy/SketchyShape";

export function IntegrationNodeComponent(props: NodeProps<IntegrationNode>): React.JSX.Element {
  const { id } = props;
  const { description } = props.data;
  const { resolvedTheme } = useTheme();

  const activateCommand = useCommandStore((state) => state.activateCommand);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!props.data.url) return;
    if (event.altKey) {
      activateCommand("open-integration-dialog", { type: props.data.type, url: props.data.url });
    }
  }

  const handleDoubleClick = () => {
    if (!props.data.url) return;
    activateCommand("open-integration-dialog", { type: props.data.type, url: props.data.url });
  }

  const textClass = getTailwindTextClass(DEFAULT_STROKE_COLOR, resolvedTheme);

  // Adjust stroke width based on zoom to maintain consistent visual appearance
  // const adjustedStrokeWidth = React.useMemo(() => {
  //   const baseStrokeWidth = 2;
  //   return Math.max(0.5, baseStrokeWidth / viewport.zoom -1);
  // }, [viewport.zoom]);

  return (
    <div
      className="group relative inline-block align-middle shrink-0 p-1 size-8"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        isVisible={props.selected}
        shouldResize={() => false}
        handleStyle={{ width: 0, height: 0, border: "transparent" }}
      />
      <SketchyShape
        kind="ellipse"
        strokeWidth={7}
        strokeColor={DEFAULT_STROKE_COLOR}
        className="absolute p-0 inset-0 z-0 size-full px-0.5 cursor-pointer overflow-visible"
      />
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <div className="relative inset-0 z-10 flex items-center justify-center">
              {props.data.type === "github" && (
                <Github className={`p-1 size-full ${textClass}`} />
              )}
              {props.data.type === "figma" && (
                <Figma className={`p-1 size-full ${textClass}`} />
              )}
            </div>
          </TooltipTrigger>
          {description && !props.dragging && (
            <TooltipContent className="transition-all duration-500">
              {description}
            </TooltipContent>
          )}
        </Tooltip>
        <>
          <Handle type="source" position={Position.Bottom} id={`${id}-bottom`} className="opacity-5 group-hover:opacity-100" />
          <Handle type="source" position={Position.Left} id={`${id}-left`} className="opacity-5 group-hover:opacity-100" />
          <Handle type="source" position={Position.Right} id={`${id}-right`} className="opacity-5 group-hover:opacity-100" />
          <Handle type="source" position={Position.Top} id={`${id}-top`} className="opacity-5 group-hover:opacity-100" />
        </>
    </div>

  );
}
