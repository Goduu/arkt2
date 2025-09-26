import { Color } from "@/components/colors/types";
import { IconKey } from "@/lib/icons/iconRegistry";
import { Node } from "@xyflow/react";

export type ArktNodeData = {
    pathId: string;
    label: string;
    description: string;
    fillColor: Color;
    textColor: Color;
    iconKey?: IconKey;
    rotation: number;
    fontSize: number;
    isDraft: boolean;
    strokeWidth: number;
    strokeColor: Color;
    strokeLineDash?: number[];
    templateId?: string;
    virtualOf?: string;
    expandGroupId?: string;
    isEphemeralExpansion: boolean;
};

export type ArktNode = Node<ArktNodeData, 'arktNode'>;