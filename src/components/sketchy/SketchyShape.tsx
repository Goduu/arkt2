"use client";

import rough from "roughjs/bin/rough";
import { Options as RoughOptions } from "roughjs/bin/core";
import {
  JSX, useRef,
  useMemo,
  useLayoutEffect
} from "react";
import { Color } from "../colors/types";
import { colorToHex } from "../colors/utils";
import { cn } from "../utils";
import { useTheme } from "next-themes";

export type SketchyShapeKind = "rectangle" | "ellipse" | "diamond";

type SketchyShapeProps = {
  width?: number;
  height?: number;
  kind: SketchyShapeKind;
  fillColor?: Color;
  strokeColor?: Color;
  strokeWidth?: number;
  roughness?: number; // 0..4 typical
  seed?: number; // stable randomness per node
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots" | "dashed" | "zigzag-line";
  strokeLineDash?: number[];
  strokeLineDashOffset?: number;
  className?: string;
  // New prop for border inset control
  borderInset?: number;
  fillWeight?: number;
  hachureGap?: number;
};

export function SketchyShape(props: SketchyShapeProps): JSX.Element {
  const {
    width = 100,
    height = 100,
    kind,
    fillColor,
    strokeColor,
    strokeWidth = 2,
    roughness = 1.5,
    seed,
    fillStyle = "hachure",
    strokeLineDash,
    strokeLineDashOffset,
    className,
    borderInset,
    fillWeight = 1,
    hachureGap = 5,
  } = props;
  const { theme } = useTheme();

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Memoize expensive computations
  const dimensions = useMemo(() => {
    const w = Math.max(4, Math.floor(width));
    const h = Math.max(4, Math.floor(height));

    // Validate dimensions
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      return null;
    }

    return { w, h };
  }, [width, height]);

  const colors = useMemo(() => {
    const resolvedFill = fillColor ? colorToHex(fillColor, "#ffffff", theme) : "transparent";
    return {
      fill: resolvedFill,
      stroke: colorToHex(strokeColor, "#111827", theme),
    };
  }, [fillColor, strokeColor, theme]);

  const roughOptions = useMemo((): RoughOptions => {

    // https://github.com/rough-stuff/rough/wiki#options
    const opts: RoughOptions = {
      roughness,
      stroke: colors.stroke,
      strokeWidth,
      strokeLineDash,
      fill: colors.fill,
      fillStyle,
      fillWeight,
      hachureGap,
      hachureAngle: 40,
      seed: seed ?? undefined,
      preserveVertices: true,
    };

    if (strokeLineDash && Array.isArray(strokeLineDash)) {
      opts.strokeLineDash = strokeLineDash;
      if (typeof strokeLineDashOffset === "number") {
        opts.strokeLineDashOffset = strokeLineDashOffset;
      }
    }

    return opts;
  }, [roughness, colors, strokeWidth, fillStyle, strokeLineDash, strokeLineDashOffset, seed, dimensions]);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg || !dimensions) return;

    const { w, h } = dimensions;

    try {
      // Clear previous content
      svg.innerHTML = '';

      // Create fresh container group
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svg.appendChild(group);

      // Update viewBox with small padding to ensure hachure renders properly
      const viewBoxPadding = 2;
      svg.setAttribute("viewBox", `${-viewBoxPadding} ${-viewBoxPadding} ${w + viewBoxPadding * 2} ${h + viewBoxPadding * 2}`);

      // Calculate insets to prevent clipping
      const inset = borderInset ?? Math.max(1, Math.min(w, h) * 0.02);
      const x = inset;
      const y = inset;
      const renderWidth = Math.max(1, w - inset * 2);
      const renderHeight = Math.max(1, h - inset * 2);

      // Force a fresh RoughJS instance for each render to avoid caching issues
      const rc = rough.svg(svg, { options: { seed: seed ?? Math.floor(Math.random() * 1000) } });

      // Render shape
      let shapeNode: SVGElement;
      if (kind === "ellipse") {
        shapeNode = rc.ellipse(
          x + renderWidth / 2,
          y + renderHeight / 2,
          renderWidth * 1,
          renderHeight / 1.04,
          roughOptions
        );
      } else if (kind === "diamond") {
        // Calculate diamond points as [x, y] tuples
        const diamondPoints: [number, number][] = [
          [x + renderWidth / 2, y], // top
          [x + renderWidth, y + renderHeight / 2], // right
          [x + renderWidth / 2, y + renderHeight], // bottom
          [x, y + renderHeight / 2], // left
        ];
        shapeNode = rc.polygon(diamondPoints, roughOptions);
      }
      else {
        shapeNode = rc.rectangle(x, y, renderWidth, renderHeight, roughOptions);
      }

      group.appendChild(shapeNode);
    } catch (error) {
      console.error("Failed to render sketchy shape:", error);
      // Optionally render a fallback shape or leave empty
    }
  }, [dimensions, kind, roughOptions, borderInset, theme]);

  return (
    <svg
      data-allow-resize
      ref={svgRef}
      className={cn("scrollbar-hide", className)}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    />
  );
}

export default SketchyShape;