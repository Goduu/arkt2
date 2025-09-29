import { Color } from "@/components/colors/types";
import { Node } from "@xyflow/react";
import { CommonNodeData } from "../arkt/types";

export type ArktTextNodeData = CommonNodeData & {
    label: string;
    fillColor?: Color;
    strokeColor?: Color;
    rotation?: number;
    fontSize?: number;
    isDraft: boolean;
};

export type ArktTextNode = Node<ArktTextNodeData, 'text'>;