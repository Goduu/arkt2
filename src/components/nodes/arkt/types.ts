import { Color } from "@/components/colors/types";
import { IconKey } from "@/lib/icons/iconRegistry";
import { Node } from "@xyflow/react";

export type CommonNodeData = {
    pathId: string;
    selectedBy?: string;
}

export type ArktNodeData = CommonNodeData & {
    label: string;
    description: string;
    fillColor: Color;
    textColor: Color;
    strokeColor: Color;
    strokeWidth: number;
    strokeLineDash?: number[];
    iconKey?: IconKey;
    rotation: number;
    fontSize: number;
    isDraft: boolean;
    templateId?: string;
    virtualOf?: string;
};

export type ArktNode = Node<ArktNodeData, 'arktNode'>;