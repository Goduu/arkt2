import { Color } from "@/components/colors/types";
import { Node } from "@xyflow/react";
import { CommonNodeData } from "../arkt/types";

export type Points = [number, number, number][];

export type ArktFreehandNodeData = CommonNodeData & {
    points: Points;
    fillColor: Color;
    strokeColor: Color;
    rotation: number;
    initialSize: { width: number; height: number };
}

export type FreehandNodeType = Node<
    ArktFreehandNodeData,
    'freehand'
>;