import { ColorSelector } from "@/components/diagram/ColorSelector";
import { FC } from "react";
import type { Color } from "./types";
import { TAILWIND_FILL_COLORS } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FontSizeSelector } from "@/components/diagram/edges/FontSizeSelector";

type TextNodeControlsProps = {
    label: string;
    fillColor: Color;
    textColor: Color;
    fontSize?: number;
    commit: (partial?: Partial<{ label: string; fillColor: Color; textColor: Color; fontSize: number }>) => void;
};

export const TextNodeControls: FC<TextNodeControlsProps> = ({
    label,
    fillColor,
    textColor,
    fontSize = 15,
    commit,
}) => {
    return (
        <div data-testid="text-controls">
            <div className="flex gap-4 flex-col">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Label</label>
                    <Input
                        className="w-full px-2 bg-transparent"
                        value={label}
                        onChange={(e) => commit({ label: e.target.value })}
                        data-testid="text-controls-label"
                    />
                </div>
                <div data-testid="text-fontsize-group">
                    <FontSizeSelector
                        selectedFontSize={fontSize}
                        onChange={(v) => commit({ fontSize: v })}
                    />
                </div>
                <div data-testid="fill-color-group">
                    <ColorSelector
                        label="Fill color"
                        defaultOptions={TAILWIND_FILL_COLORS}
                        value={fillColor}
                        shade={"300"}
                        onChange={(next) => commit({ fillColor: next })}
                    />
                </div>
                <div data-testid="text-color-group">
                    <ColorSelector
                        label="Text color"
                        value={textColor}
                        shade={"700"}
                        onChange={(next) => commit({ textColor: next })}
                    />
                </div>
            </div>
        </div>
    );
};