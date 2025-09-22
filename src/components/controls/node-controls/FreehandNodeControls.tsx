import { FC } from "react";
import { ColorSelector } from "../ColorSelector";
import { TAILWIND_FILL_COLORS } from "@/components/colors/utils";
import { useFreeHandNodeControls } from "@/components/nodes/freehand/useFreeHandNodeControls";
import { FreehandNodeType } from "@/components/nodes/freehand/types";

type FreehandNodeControlsProps = {
    node: FreehandNodeType;
};

export const FreehandNodeControls: FC<FreehandNodeControlsProps> = ({
    node,
}) => {
    const { fillColor, strokeColor } = node.data;
    const { onNodeUpdate } = useFreeHandNodeControls(node.id);

    return (
        <div data-testid="freehand-controls">
            <div className="flex gap-4 flex-col">
                <div data-testid="fill-color-group">
                    <ColorSelector
                        label="Fill color"
                        defaultOptions={TAILWIND_FILL_COLORS}
                        value={fillColor}
                        indicative={"low"}
                        onChange={(next) => onNodeUpdate({ fillColor: next })}
                    />
                </div>
                <div data-testid="stroke-color-group">
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