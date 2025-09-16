import { Node } from "@xyflow/react";

export type Points = [number, number, number][];

export type FreehandNodeData = {
    pathId: string;
    points: Points;
    initialSize: { width: number; height: number };
}

export type FreehandNodeType = Node<
    FreehandNodeData,
    'freehand'
>;