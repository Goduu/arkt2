import { EdgeLabelRenderer } from "@xyflow/react";
import { cn } from "../../utils";
import { getTailwindTextClass } from "../../colors/utils";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from "../../colors/constants";
import SketchyShape from "../../sketchy/SketchyShape";
import { AutoWidthInput } from "@/components/ui/auto-width-input";
import { useEdgeControls } from "./useEdgeControls";
import { useEffect, useRef } from "react";

type EdgeLabelProps = {
    id: string;
    labelText: string;
    isEditing: boolean;
    labelX: number;
    labelY: number;
    onBlur: () => void;
    onDoubleClick: () => void;
}
export const EdgeLabel = ({ id, labelText, isEditing, labelX, labelY, onBlur, onDoubleClick }: EdgeLabelProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const { onLabelChange } = useEdgeControls(id);

    useEffect(() => {
        if (isEditing) {
            // Focus and select on the next frame to ensure the input is mounted/styled
            const rafId = requestAnimationFrame(() => {
                inputRef.current?.focus();
                // Select the entire text for immediate typing overwrite
                inputRef.current?.setSelectionRange(0, labelText.length);
            });
            return () => cancelAnimationFrame(rafId);
        }
    }, [isEditing, labelText.length]);

    const showLabel = (labelText && labelText.length > 0) || isEditing;
    const textClass = getTailwindTextClass(DEFAULT_STROKE_COLOR)


    return (
        <EdgeLabelRenderer>
            <div
                style={{
                    position: "absolute",
                    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    pointerEvents: "all",
                }}
                className={cn("nodrag z-30 size-10 bg-red-500", showLabel ? "opacity-100" : "opacity-100")}
                data-testid="arch-edge-label"
            >
                <div
                    className={cn("relative", getTailwindTextClass(DEFAULT_STROKE_COLOR))}
                    onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
                >
                    <SketchyShape
                        className="absolute inset-0 pointer-events-none -z-10 w-full h-full"
                        kind={"rectangle"}
                        fillColor={DEFAULT_FILL_COLOR}
                        strokeColor={DEFAULT_STROKE_COLOR}
                        strokeWidth={2}
                        roughness={1}
                        fillStyle={"solid"}
                        seed={id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)}
                    />
                    {showLabel && (
                        <AutoWidthInput
                            ref={inputRef}
                            hideStroke
                            className={cn(
                                "outline-none m-0 py-0 z-10",
                                isEditing ? "w-auto nodrag nowheel pointer-events-auto" : "w-auto pointer-events-none",
                                textClass
                            )}
                            onBlur={onBlur}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => { if (isEditing) e.stopPropagation(); }}
                            onPointerDown={(e) => { if (isEditing) e.stopPropagation(); }}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (isEditing) {
                                    if (e.key === "Escape") {
                                        e.preventDefault();
                                        (e.target as HTMLInputElement).blur();
                                    }
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }
                            }}
                            type="text"
                            value={labelText}
                            onChange={(e) => {
                                const next = e.target.value;
                                onLabelChange(next);
                            }}
                            readOnly={!isEditing}
                            spellCheck={false}
                            data-testid="text-inline-input"
                        />
                    )}
                </div>


            </div>
        </EdgeLabelRenderer>
    )
}