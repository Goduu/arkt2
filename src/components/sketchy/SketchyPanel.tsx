"use client";

import * as React from "react";
import { FillStyle } from "./types";
import { Color } from "../colors/types";
import { useElementSize } from "./hooks/useElementSize";
import { SketchyBorderOverlay } from "./SketchyBorderOverlay";

export type SketchyPanelProps = React.PropsWithChildren<{
  className?: string;
  strokeWidth?: number;
  roughness?: number;
  strokeColor?: Color;
  hoverEffect?: boolean;
  fillColor?: Color;
  strokeLineDash?: number[];
  strokeLineDashOffset?: number;
  fillWeight?: number;
  fillStyle?: FillStyle;
  seed?: number;
}>;

export function SketchyPanel({ className, strokeWidth = 2, roughness = 1.5, strokeColor, hoverEffect = false, children, strokeLineDash, strokeLineDashOffset, fillColor, fillWeight, fillStyle, seed }: SketchyPanelProps): React.JSX.Element {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [hovered, setHovered] = React.useState(false);
  // No explicit theme dependency here because nested Sketchy components listen to theme changes

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className || ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="pointer-events-none absolute inset-0 scrollbar-hide">
        <SketchyBorderOverlay
          seed={hovered && hoverEffect ? 20 : seed ?? 1}
          width={size.width}
          height={size.height}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          roughness={roughness}
          className="w-full h-full"
          strokeLineDash={strokeLineDash}
          strokeLineDashOffset={strokeLineDashOffset}
          fillColor={fillColor}
          fillWeight={fillWeight}
          fillStyle={fillStyle}
        />
      </div>
      <div className="relative overflow-auto p-2">
        {children}
      </div>
    </div>
  );
}


