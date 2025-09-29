"use client";

import * as React from "react";
import { Figma, Github } from "lucide-react";
import { IntegrationNode } from "./type";
import { NodeProps, Position } from "@xyflow/system";
import { Handle, NodeResizer } from "@xyflow/react";
import { SketchyPanel } from "@/components/sketchy/SketchyPanel";
import { useCommandStore } from "@/app/design/commandStore";
import { DEFAULT_STROKE_COLOR, getTailwindTextClass } from "@/components/colors/utils";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function IntegrationNodeComponent(props: NodeProps<IntegrationNode>): React.JSX.Element {
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

  return (
    <div
      className="group"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        isVisible={props.selected}
        minWidth={30}
        minHeight={30}
        maxWidth={30}
        maxHeight={30}
        handleStyle={{ width: 0, height: 0 }}
      />
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <SketchyPanel
            kind={"ellipse"}
            strokeWidth={2}
            className="cursor-pointer relative overflow-visible"
          >
            {props.data.type === "github" && (
              <Github className={`p-1 size-6 ${textClass}`} />
            )}
            {props.data.type === "figma" && (
              <Figma className={`p-1 size-6 ${textClass}`} />
            )}

          </SketchyPanel>
        </TooltipTrigger>
        {description && !props.dragging && (
          <TooltipContent className="transition-all duration-500">
            {description}
          </TooltipContent>
        )}
      </Tooltip>
      <>
        <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-5 group-hover:opacity-100" />
        <Handle type="source" position={Position.Left} id="left" className="opacity-5 group-hover:opacity-100" />
        <Handle type="source" position={Position.Right} id="right" className="opacity-5 group-hover:opacity-100" />
        <Handle type="source" position={Position.Top} id="top" className="opacity-5 group-hover:opacity-100" />
      </>
    </div>

  );
}
