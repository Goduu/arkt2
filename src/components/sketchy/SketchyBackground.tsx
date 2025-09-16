"use client";

import * as React from "react";
import { SketchyBorderOverlay } from "@/components/ui/sketchy/SketchyBorderOverlay";
import { useElementSize } from "@/components/ui/useElementSize";
import { Color } from "../../diagram/flow-editor/node-controls/types";
import { FillStyle } from "./types";

type SketchyBackgroundProps = React.PropsWithChildren<{
    className?: string;
    strokeWidth?: number;
    roughness?: number;
    strokeColor?: Color;
    fillColor?: Color;
    fillStyle?: FillStyle;
    fillWeight?: number;
    hoverEffect?: boolean;
}>;

export function SketchyBackground({
    className,
    roughness = 1.5,
    strokeColor,
    fillColor,
    fillStyle = "dots",
    fillWeight = 1,
    hoverEffect = false, children }: SketchyBackgroundProps): React.JSX.Element {
    const { ref, size } = useElementSize<HTMLDivElement>();
    const [hovered, setHovered] = React.useState(false);

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden ${className || ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="pointer-events-none absolute inset-0">
                <SketchyBorderOverlay
                    seed={hovered && hoverEffect ? 20 : 1}
                    width={size.width}
                    height={size.height}
                    strokeColor={strokeColor}
                    strokeWidth={0}
                    roughness={roughness}
                    fillColor={fillColor}
                    fillStyle={fillStyle}
                    fillWeight={fillWeight}
                    className="w-full h-full" />
            </div>
            <div className="relative overflow-scroll p-2">
                {children}
            </div>
        </div>
    );
}


