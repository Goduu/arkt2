import { Node } from "@xyflow/react";
import { CommonNodeData } from "../arkt/types";

export type ArktIntegrationNodeData = CommonNodeData & {
    type: "github" | "figma",
    url: string,
    description: string,
}

export type IntegrationNode = Node<ArktIntegrationNodeData, 'integration'>;