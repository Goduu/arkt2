import { Node } from "@xyflow/react";

export type IntegrationNodeData = {
    type: "github" | "figma",
    pathId: string,
    url: string,
    description: string,
}

export type IntegrationNode = Node<IntegrationNodeData, 'integration'>;