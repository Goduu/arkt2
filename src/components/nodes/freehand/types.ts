import { Color } from "@/components/colors/types";
import { Node } from "@xyflow/react";

export type Points = [number, number, number][];

export type FreehandNodeData = {
    pathId: string;
    points: Points;
    fillColor: Color;
    initialSize: { width: number; height: number };
}

export type FreehandNodeType = Node<
    FreehandNodeData,
    'freehand'
>;