import { Color } from "@/components/colors/types";
import { ColorSelector } from "../ColorSelector";
import { EdgeTypes } from "@xyflow/react";
import { EdgeTypeSelector } from "../EdgeTypeSelector";
import { StrokeWidth } from "../StrokeWidth";
import useNodesStateSynced from "@/components/yjs/useNodesStateSynced";

type LineNodeControlsProps = {
    lineStrokeColor: Color;
    lineStrokeWidth: number;
    edgeType: EdgeTypes;
    commitLine: (partial?: LineCommit) => void;
}
export const LineNodeControls = ({ lineStrokeColor, lineStrokeWidth, edgeType: lineShape, commitLine }: LineNodeControlsProps) => {
    const [, setNodes] = useNodesStateSynced();

    return (
        <div className="flex flex-col gap-4">
            <EdgeTypeSelector
                selectedStrokeType={lineShape}
                onChange={(p) => commitLine({ type: p })}
            />
            <ColorSelector
                label="Stroke color"
                value={lineStrokeColor}
                indicative={"low"}
                onChange={(color) => {
                    commitLine({ strokeColor: color });
                }}
            />
            <StrokeWidth
                selectedWidth={lineStrokeWidth}
                commit={(p) => commitLine({ strokeWidth: Number(p?.strokeWidth ?? lineStrokeWidth) })}
            />
            {/* <StrokeType hideAnimate value={[effectiveDashed ? "dashed" : null].filter((v): v is string => typeof v === "string")}
                onChange={(values: string[]) => {
                    commitLine({ form: values.includes("dashed") ? "dashed" : "solid" as LineForm })
                }}
            /> */}
        </div>
    );
};

export type LineCommit = Partial<{
    strokeColor: Color;
    strokeWidth: number;
    form: LineForm;
    type: EdgeType;
}>;