"use client";

import * as React from "react";
import SketchyShape from "./SketchyShape";
import { Color } from "../colors/types";
import { DEFAULT_STROKE_COLOR } from "../colors/utils";

type SketchyBorderOverlayProps = {
  width: number;
  height: number;
  strokeWidth?: number;
  roughness?: number;
  className?: string;
  fillColor?: Color | null; // null/undefined => transparent
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots" | "dashed" | "zigzag-line";
  strokeColor?: Color;
  seed?: number;
  fillWeight?: number
  strokeLineDash?: number[];
  strokeLineDashOffset?: number;
};

export function SketchyBorderOverlay({
  width,
  height,
  strokeWidth = 2,
  roughness = 1.5,
  className,
  fillColor,
  fillStyle = "hachure",
  strokeColor,
  fillWeight = 1,
  seed = 1,
  strokeLineDash,
  strokeLineDashOffset,
}: SketchyBorderOverlayProps): React.JSX.Element | null {
  if (!width || !height) return null;

  return (
    <SketchyShape
      kind="rectangle"
      width={width}
      height={height}
      strokeColor={strokeColor ?? DEFAULT_STROKE_COLOR}
      strokeWidth={strokeWidth}
      roughness={roughness}
      fillStyle={fillStyle}
      fillColor={fillColor ?? undefined}
      fillWeight={fillWeight}
      borderInset={1}
      className={className}
      seed={seed}
      strokeLineDash={strokeLineDash}
      strokeLineDashOffset={strokeLineDashOffset}
    />
  );
}


