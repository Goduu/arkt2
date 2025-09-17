import { ColorSelector } from "../ColorSelector";
import { StrokeWidth } from "../edges/StrokeWidth";
import { EDGE_TYPES, EdgeTypeSelector } from "../edges/EdgeTypeSelector";
import { Color, EdgeType, LineForm } from "./types";
import { StrokeType } from "../edges/StrokeType";

type LineNodeControlsProps = {
    lineStrokeColor: Color;
    lineStrokeWidth: number;
    edgeType: EdgeType;
    form?: LineForm;
    commitLine: (partial?: LineCommit) => void;
}
export const LineNodeControls = ({ lineStrokeColor, lineStrokeWidth, edgeType: lineShape, form, commitLine }: LineNodeControlsProps) => {
    const effectiveDashed = form === "dashed";
    return (
        <div className="flex flex-col gap-4">
            <EdgeTypeSelector
                options={EDGE_TYPES.filter((s) => s.value !== "step")}
                selectedStrokeType={lineShape}
                onChange={(p) => commitLine({ type: p })}
            />
            <ColorSelector
                label="Stroke color"
                value={lineStrokeColor}
                shade={"700"}
                onChange={(color) => {
                    commitLine({ strokeColor: color });
                }}
            />
            <StrokeWidth
                selectedWidth={lineStrokeWidth}
                commit={(p) => commitLine({ strokeWidth: Number(p?.strokeWidth ?? lineStrokeWidth) })}
            />
            <StrokeType hideAnimate value={[effectiveDashed ? "dashed" : null].filter((v): v is string => typeof v === "string")}
                onChange={(values: string[]) => {
                    commitLine({ form: values.includes("dashed") ? "dashed" : "solid" as LineForm })
                }}
            />
        </div>
    );
};

export type LineCommit = Partial<{
    strokeColor: Color;
    strokeWidth: number;
    form: LineForm;
    type: EdgeType;
}>;