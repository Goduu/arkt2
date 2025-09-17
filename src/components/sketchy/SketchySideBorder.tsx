"use client";

import * as React from "react";
import rough from "roughjs/bin/rough";
import { Color } from "@/components/colors/types";
import { colorToHex, DEFAULT_STROKE_COLOR } from "@/components/colors/utils";
import { Options } from "roughjs/bin/core";
import { useElementSize } from "./hooks/useElementSize";
import { useTheme } from "next-themes";

type Side = "top" | "right" | "bottom" | "left";

type SketchySideBorderProps = {
  side: Side;
  thickness?: number;
  strokeColor?: Color;
  strokeWidth?: number;
  roughness?: number;
  seed?: number;
  className?: string;
  strokeLineDash?: number[];
  strokeLineDashOffset?: number;
};

export function SketchySideBorder({
  side,
  thickness = 8,
  strokeColor = DEFAULT_STROKE_COLOR,
  strokeWidth = 2,
  roughness = 1.05,
  seed,
  className,
  strokeLineDash,
  strokeLineDashOffset,
}: SketchySideBorderProps): React.JSX.Element {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const { theme } = useTheme();

  const isHorizontal = side === "top" || side === "bottom";

  React.useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const w = Math.max(1, Math.floor(size.width || 0));
    const h = Math.max(1, Math.floor(size.height || 0));
    if (w <= 0 || h <= 0) return;

    try {
      svg.innerHTML = "";
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svg.appendChild(group);

      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      const rc = rough.svg(svg, { options: { seed: seed ?? Math.floor(Math.random() * 1000) } });

      const roughOptions: Options = {
        roughness,
        stroke: colorToHex(strokeColor, "#111827"),
        strokeWidth,
      };
      if (Array.isArray(strokeLineDash)) roughOptions.strokeLineDash = strokeLineDash;
      if (typeof strokeLineDashOffset === "number") roughOptions.strokeLineDashOffset = strokeLineDashOffset;

      const half = isHorizontal ? h / 2 : w / 2;
      const line = isHorizontal
        ? rc.line(0, half, w, half, roughOptions)
        : rc.line(half, 0, half, h, roughOptions);
      group.appendChild(line);
    } catch {
      // ignore
    }
  }, [size.width, size.height, isHorizontal, strokeColor, strokeWidth, roughness, seed, strokeLineDash, strokeLineDashOffset, theme]);

  const positionClasses = (() => {
    if (side === "top") return "absolute left-0 right-0 top-0";
    if (side === "bottom") return "absolute left-0 right-0 bottom-0";
    if (side === "left") return "absolute top-0 bottom-0 left-0";
    return "absolute top-0 bottom-0 right-0";
  })();

  const sizeStyle: React.CSSProperties = isHorizontal
    ? { height: thickness }
    : { width: thickness };

  return (
    <div ref={ref} className={`pointer-events-none ${positionClasses} ${className || ""}`} style={sizeStyle} aria-hidden>
      <svg ref={svgRef} width={size.width} height={size.height} preserveAspectRatio="none" className="block w-full h-full" />
    </div>
  );
}

export default SketchySideBorder;


