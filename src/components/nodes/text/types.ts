import { Color } from "@/components/colors/types";
import { Node } from "@xyflow/react";

export type ArktTextNodeData = {
    pathId: string;
    label: string;
    fillColor?: Color;
    strokeColor?: Color;
    rotation?: number;
    fontSize?: number;
    isDraft: boolean;
};

export type ArktTextNode = Node<ArktTextNodeData, 'text'>;