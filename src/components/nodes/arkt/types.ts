import { Color } from "@/components/colors/types";
import { Node } from "@xyflow/react";

export type ArktNodeData = {
    pathId: string;
    label: string;
    description: string;
    fillColor: Color;
    textColor: Color;
    iconKey: string;
    githubLink: string;
    templateId: string;
    rotation: number;
    strokeWidth: number;
    virtualOf: string;
    fontSize: number;
    expandGroupId: string;
    isDraft: boolean;
    strokeColor: Color;
    isEphemeralExpansion: boolean;
    originalId: string;
};

export type ArktNode = Node<ArktNodeData>;