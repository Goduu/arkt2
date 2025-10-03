"use client";

import * as React from "react";
import { FillStyle } from "./types";
import { Color } from "../colors/types";
import { useElementSize } from "./hooks/useElementSize";
import { SketchyBorderOverlay } from "./SketchyBorderOverlay";
import { SketchyShapeKind } from "./SketchyShape";
import { cn } from "../utils";

export type SketchyPanelProps = React.PropsWithChildren<
  {
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
    kind?: SketchyShapeKind;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
  }
>;

export const SketchyPanel = React.forwardRef<HTMLDivElement, SketchyPanelProps>(function SketchyPanel(
  { className,
    strokeWidth = 2,
    roughness = 1.5,
    strokeColor,
    hoverEffect = false,
    children,
    strokeLineDash,
    strokeLineDashOffset,
    fillColor,
    fillWeight,
    fillStyle,
    seed,
    kind,
    onMouseEnter,
    onMouseLeave,
    ...rest
  },
  forwardedRef
): React.JSX.Element {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [hovered, setHovered] = React.useState(false);
  // No explicit theme dependency here because nested Sketchy components listen to theme changes

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [forwardedRef, ref]
  );

  return (
    <div
      ref={setRefs}
      className={cn("relative overflow-hidden p-1", className)}
      onMouseEnter={() => {
        setHovered(true)
        onMouseEnter?.()
      }}
      onMouseLeave={() => {
        setHovered(false)
        onMouseLeave?.()
      }}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-0">
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
          kind={kind}
        />
      </div>
      <div className="relative overflow-auto">
        {children}
      </div>
    </div>
  );
});


