import { FC } from "react";
import { Input } from "@/components/ui/input";
import { FontSizeSelector } from "../FontSizeSelector";
import { ColorSelector } from "../ColorSelector";
import { TAILWIND_FILL_COLORS } from "@/components/colors/utils";
import { ArktTextNode } from "@/components/nodes/text/types";
import { useTextNodeControls } from "@/components/nodes/text/useTextNodeControls";

type TextNodeControlsProps = {
    node: ArktTextNode;
};

export const TextNodeControls: FC<TextNodeControlsProps> = ({
    node,
}) => {
    const { label, fillColor, strokeColor, fontSize } = node.data;
    const { onNodeUpdate } = useTextNodeControls(node.id);
    return (
        <div data-testid="text-controls">
            <div className="flex gap-4 flex-col">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Label</label>
                    <Input
                        className="w-full px-2 bg-transparent"
                        value={label}
                        onChange={(e) => onNodeUpdate({ label: e.target.value })}
                        data-testid="text-controls-label"
                    />
                </div>
                <div data-testid="text-fontsize-group">
                    <FontSizeSelector
                        selectedFontSize={fontSize ?? 15}
                        onChange={(v) => onNodeUpdate({ fontSize: v })}
                    />
                </div>
                <div data-testid="fill-color-group">
                    <ColorSelector
                        label="Fill color"
                        defaultOptions={TAILWIND_FILL_COLORS}
                        value={fillColor}
                        indicative={"low"}
                        onChange={(next) => onNodeUpdate({ fillColor: next })}
                    />
                </div>
                <div data-testid="text-color-group">
                    <ColorSelector
                        label="Stroke color"
                        value={strokeColor}
                        indicative={"high"}
                        onChange={(next) => onNodeUpdate({ strokeColor: next })}
                    />
                </div>
            </div>
        </div>
    );
};