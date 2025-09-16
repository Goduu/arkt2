import { Node } from "@xyflow/react";

export type ArktNodeData = {
    pathId: string;
    label: string;
};

export type ArktNode = Node<ArktNodeData>;