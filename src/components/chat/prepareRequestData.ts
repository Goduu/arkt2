import { TemplateData } from "../templates/types";
import { loadEncryptedAIKey } from "@/lib/ai/aiKey";

export function prepareRequestData(
    rootId: string,
    mentions: Array<{ id: string; label: string }>,
    tag: string,
    nodeTemplates: TemplateData[]
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
