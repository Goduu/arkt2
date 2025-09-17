import { Color } from "../../colors/types";
import { Algorithm } from "./constants";
import { Edge, XYPosition } from "@xyflow/react";


export type ControlPointProps = {
    id: string;
    index: number;
    x: number;
    y: number;
    color: string;
    active?: boolean;
    setControlPoints: (
        update: (points: ControlPointData[]) => ControlPointData[]
    ) => void;
};

export type ControlPointData = XYPosition & {
    id: string;
    active?: boolean;
    prev?: XYPosition;
};

export type ArktEdgeData = {
    pathId: string,
    strokeColor?: Color
    strokeWidth?: number
    algorithm: Algorithm
    points: ControlPointData[]
    label?: string
    fontSize: number
    labelFill: Color
}

export type ArktEdge = Edge<ArktEdgeData>;
