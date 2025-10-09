import { EdgeLabelOptions, EdgeLabelRenderer } from "@xyflow/react";
import { cn } from "../../utils";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR, getTailwindTextClass } from "../../colors/utils";
import { useEdgeControls } from "./useEdgeControls";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Color } from "@/components/colors/types";
import { AutoGrowInput } from "../../ui/AutoGrowInput";

type EdgeLabelProps = EdgeLabelOptions & {
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
export const EdgeLabel = (props: EdgeLabelProps) => {
    const {
        id,
        labelText,
        isEditing,
        labelX,
        labelY,
        fillColor = DEFAULT_FILL_COLOR,
        strokeColor = DEFAULT_STROKE_COLOR,
        fontSize = 12,
        selected,
        onBlur,
        onClick,
    } = props;

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
                className={cn("nodrag z-30 w-auto px-0.5 ", showLabel ? "opacity-100" : "opacity-10")}
                data-testid="arkt-edge-label"
            >
                <div
                    className={cn("relative overflow-hidden", getTailwindTextClass(DEFAULT_STROKE_COLOR, theme))}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isEditing) return
                        inputRef.current?.focus();
                        onClick();
                    }}
                >
                    {showLabel && (
                        <AutoGrowInput
                            ref={inputRef}
                            fillStyle="solid"
                            className={cn(
                                "outline-none m-0 py-0 z-10",
                                isEditing ? "w-full nodrag nowheel pointer-events-auto" : "w-full pointer-events-none",
                                textClass,
                            )}
                            placeholder="+label"
                            fillColor={fillColor}
                            strokeColor={strokeColor}
                            value={draft}
                            fontSize={fontSize}
                            onChange={(value) => {
                                if (typeof value !== "string") return
                                setDraft(value);
                            }}
                            onBlur={() => {
                                if (isEditing) {
                                    onEdgeUpdate({ label: draft || "" });
                                    onBlur()
                                }
                            }}
                            data-testid="text-inline-input"
                        />
                    )}
                </div>
            </div>
        </EdgeLabelRenderer>
    )
}