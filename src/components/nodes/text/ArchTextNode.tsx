"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Color } from "@/components/colors/types";
import { useReactFlow } from "@xyflow/react";
import { NodeProps } from "@xyflow/system";
import { ArktTextNode } from "./types";
import { DEFAULT_FILL_COLOR, getTailwindTextClass } from "@/components/colors/utils";
import SketchyShape from "@/components/sketchy/SketchyShape";
import { AutoGrowInput } from "@/components/ui/AutoGrowInput";

export type ArchTextNodeData = {
    label: string;
    fillColor?: Color;
    textColor?: Color;
    strokeColor?: Color;
    iconKey?: string;
    rotation?: number;
    fontSize?: number;
    onLabelCommit?: (newLabel: string) => void;
};

export function ArchTextNodeComponent(props: NodeProps<ArktTextNode>): React.JSX.Element {
    const { id } = props;
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const rf = useReactFlow();
    const label = props.data.label

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const outerRef = React.useRef<HTMLDivElement | null>(null);
    const paddingWrapperRef = React.useRef<HTMLDivElement | null>(null);
    const beforeEditValueRef = React.useRef<string>(props.data.label);

    const fillColor = props.data.fillColor;
    const textColor = props.data.strokeColor;
    const rotation = props.data.rotation ?? 0;
    const textClass = getTailwindTextClass(textColor)
    const fontSize = Number(props.data.fontSize ?? 15);
    const width = label.length * fontSize / 2;

	// Toggle node draggability based on editing state
	React.useEffect(() => {
		rf.setNodes((prev) =>
			prev.map((n) => (n.id === id ? { ...n, draggable: !isEditing } : n))
		);
	}, [id, isEditing, rf]);

    return (
        <div
            ref={outerRef}
            className={cn(
                "group relative rounded-md inline-block select-none",
                textClass,
            )}
            data-testid="arch-text-node"
            data-editing={isEditing ? "true" : "false"}
            onDoubleClick={(e) => {
                e.stopPropagation();
                beforeEditValueRef.current = label;
                setIsEditing(true);
                requestAnimationFrame(() => {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                });
            }}
        >
            {/* Sketchy background behind content, sized to measured node bounds */}
            {/* <div className="pointer-events-none absolute inset-0 -z-10">
                <SketchyShape
                    kind="rectangle"
                    fillColor={fillColor}
                    width={width}
                    height={20}
                    roughness={1.6}
                    strokeWidth={0}
                    fillStyle="zigzag"
                    fillWeight={1}
                    className="w-full h-full"
                    seed={fillColor?.family.length ?? 0}
                />
            </div> */}

            {/* Rotated content only, keep handles unrotated for correct edge geometry */}
            <div
                className="relative"
                style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
            >

                <div className={cn(props.selected ? "border border-violet-500" : "")} ref={paddingWrapperRef} data-testid={props.selected ? "text-node-selected" : undefined}>
                    <AutoGrowInput
                        strokeColor={textColor}
                        fillStyle="zigzag"
                        fillWeight={1}
                        roughness={1.6}
                        fillColor={fillColor ?? DEFAULT_FILL_COLOR}
                        ref={inputRef}
                        className={cn(
                            "outline-none font-medium",
                            isEditing ? "w-auto nodrag nowheel pointer-events-auto" : "w-auto pointer-events-none",
                            textClass,
                        )}
                        hideStroke
                        style={{ fontSize }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => { if (isEditing) e.stopPropagation(); }}
                        onPointerDown={(e) => { if (isEditing) e.stopPropagation(); }}
                        onDoubleClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (isEditing) {
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    // setValue(beforeEditValueRef.current);
                                    (e.target as HTMLInputElement).blur();
                                }
                            }
                        }}
                        value={label}
                        onChange={(next) => {
                            if (typeof next !== "string") return
                            rf.setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next } } : n)));
                        }}
                        onBlur={() => {
                            console.log("onBlur");
                            if (isEditing) {
                                setIsEditing(false);
                            }
                        }}
                        readOnly={!isEditing}
                        spellCheck={false}
                        data-testid="text-inline-input"
                    />
                </div>
            </div>
        </div>
    );
}


