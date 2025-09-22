import { loadEncryptedAIKey } from "@/lib/aiKey";
import { Diagram, NodeTemplate } from "@/lib/types";
import { ArktEdge, ArktNode } from "../diagram/flow-editor/node-controls/types";

export function prepareRequestData(
    rootId: string,
    mentions: Array<{ id: string; label: string }>,
    tag: string,
    nodeTemplates: Record<string, NodeTemplate>,
) {
    const encryptedKey = loadEncryptedAIKey();

    const templates = Object.values(nodeTemplates).map<MinimalTemplate>(template => {
        return {
            id: template.id,
            label: template.name,
            description: template.description ?? "",
        }
    });

    return {
        rootId,
        mentions,
        tag,
        encryptedKey,
        templates,
    };
}

export type MinimalTemplate = {
    id: string,
    label: string,
    description: string,
}

type MinimalDiagram = {
    id: string,
    name: string,
    nodes: {
        id: string,
        label: string,
        description: string,
        templateId: string,
    }[],
    edges: {
        id: string,
        nodeSourceId: string,
        nodeTargetId: string,
        label: string,
    }[],
}
const createMinimalDiagrams = (diagrams: Record<string, Diagram>) => {
    return Object.entries(diagrams).map(([id, diagram]) => {
        return {
            id,
            name: diagram.name,
            nodes: createMinimalNodes(diagram.nodes),
            edges: createMinimalEdges(diagram.edges),
        };
    });
}

const createMinimalNodes = (nodes: ArktNode[]) => {
    return nodes.map((node) => {
        return {
            id: node.id,
            label: node.data.label ?? "",
            description: node.data.description ?? "",
            templateId: node.data.templateId ?? "",
        } satisfies MinimalDiagram["nodes"][number];
    });
}

const createMinimalEdges = (edges: ArktEdge[]) => {
    return edges.map((edge) => {
        return {
            id: edge.id,
            nodeSourceId: edge.source,
            nodeTargetId: edge.target,
            label: edge.data?.label ?? "",
        } satisfies MinimalDiagram["edges"][number];
    });
}