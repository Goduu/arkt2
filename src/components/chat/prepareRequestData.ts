import { ArktEdge } from "../edges/ArktEdge/type";
import { ArktNode } from "../nodes/arkt/types";
import { TemplateData } from "../templates/types";
import { loadEncryptedAIKey } from "@/lib/ai/aiKey";

export function prepareRequestData(
    rootId: string,
    mentions: Array<{ id: string; label: string }>,
    tag: string,
    nodes: ArktNode[],
    edges: ArktEdge[],
    nodeTemplates: TemplateData[]
) {
    const encryptedKey = loadEncryptedAIKey();

    const templates = nodeTemplates.map<MinimalTemplate>(template => {
        return {
            id: template.id,
            label: template.name,
            description: template.description ?? "",
        }
    });

    const minimalNodes = nodes.map<MinimalNode>((node) => {
        return {
            id: node.id,
            data: {
                pathId: node.data.pathId,
                label: node.data.label,
                description: node.data.description,
                templateId: node.data.templateId,
                virtualOf: node.data.virtualOf,
            }
        }
    });

    const minimalEdges = edges.map<MinimalEdge>((edge) => {
        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            data: {
                label: edge.data?.label,
            }
        }
    });
    return {
        rootId,
        diagram: {
            nodes: minimalNodes,
            edges: minimalEdges,
        },
        mentions,
        tag,
        encryptedKey,
        templates,
    };
}

export type MinimalNode = {
    id: string,
    data: {
        pathId: string,
        label: string,
        description?: string,
        templateId?: string,
        virtualOf?: string,
    }
}

export type MinimalEdge = {
    id: string,
    source: string,
    target: string,
    data: {
        label?: string,
    }
}

export type MinimalTemplate = {
    id: string,
    label: string,
    description: string,
}
