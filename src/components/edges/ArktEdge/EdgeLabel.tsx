import { EdgeLabelRenderer } from "@xyflow/react";
import { cn } from "../../utils";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR, getTailwindTextClass } from "../../colors/utils";
import { AutoWidthInput } from "@/components/ui/auto-width-input";
import { useEdgeControls } from "./useEdgeControls";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Color } from "@/components/colors/types";

type EdgeLabelProps = {
    id: string;
    labelText: string;
    isEditing: boolean;
    labelX: number;
    labelY: number;
    fillColor?: Color;
    strokeColor?: Color;
    fontSize?: number;
    selected?: boolean;
    onBlur: () => void;
    onClick: () => void;
}
export const EdgeLabel = (
    { id,
        labelText,
        isEditing,
        labelX,
        labelY,
        fillColor = DEFAULT_FILL_COLOR,
        strokeColor = DEFAULT_STROKE_COLOR,
        fontSize = 12,
        selected,
        onBlur,
        onClick
    }: EdgeLabelProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();

    const { onEdgeUpdate } = useEdgeControls(id);

    const showLabel = (labelText && labelText.length > 0) || selected;
    const textClass = getTailwindTextClass(strokeColor, theme)

    // Keep a local draft to avoid committing to the global store on each keystroke,
    // which can cause remounts and caret to jump to end.
    const [draft, setDraft] = useState<string>(labelText || "");

    // Sync draft when external label changes and we're not actively editing
    useEffect(() => {
        if (!isEditing) {
            setDraft(labelText || "");
        }
    }, [labelText, isEditing]);

    return (
        <EdgeLabelRenderer>
            <div
                style={{
                    position: "absolute",
                    left: `${labelX}px`,
                    top: `${labelY}px`,
                    transform: `translate(-50%, -50%)`,
                    pointerEvents: "all",
                }}
                className={cn("nodrag z-30 w-auto", showLabel ? "opacity-100" : "opacity-10")}
                data-testid="arkt-edge-label"
            >
                <div
                    className={cn("relative", getTailwindTextClass(DEFAULT_STROKE_COLOR, theme))}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isEditing) return
                        inputRef.current?.focus();
                        onClick();
                    }}
                >
                    {showLabel && (
                        <AutoWidthInput
                            ref={inputRef}
                            className={cn(
                                "outline-none m-0 py-0 z-10 w-full",
                                isEditing ? "w-auto nodrag nowheel pointer-events-auto" : "w-auto pointer-events-none",
                                textClass,
                            )}
                            fillColor={fillColor}
                            strokeColor={strokeColor}
                            style={{ fontSize: fontSize }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => { if (isEditing) e.stopPropagation(); }}
                            onPointerDown={(e) => { if (isEditing) e.stopPropagation(); }}
                            type="text"
                            value={draft}
                            onChange={(e) => {
                                const next = e.target.value;
                                setDraft(next);
                            }}
                            onBlur={() => {
                                if (isEditing) {
                                    onEdgeUpdate({ label: draft || "" });
                                    onBlur()
                                }
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