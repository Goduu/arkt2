import useTemplateById from "@/components/yjs/useTemplateById";
import { ArktNode, ArktNodeData } from "./types";
import useNodeById from "@/components/yjs/useNodeById";

export const useNodeData = (nodeData: ArktNodeData) => {
    const virtualNode = useNodeById<ArktNode>(nodeData.virtualOf);
    const template = useTemplateById(virtualNode?.data.templateId || nodeData.templateId);

    return {
        ...nodeData,
        ...(virtualNode?.data || {}),
        strokeLineDash: virtualNode ? [4, 4] : [],
        fillColor: template?.fillColor ?? nodeData.fillColor,
        strokeColor: template?.strokeColor ?? nodeData.strokeColor,
        iconKey: template?.iconKey ?? nodeData.iconKey,
    } satisfies ArktNodeData;
}