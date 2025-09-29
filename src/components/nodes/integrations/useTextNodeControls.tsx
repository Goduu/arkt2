import useNodesStateSynced from "@/components/yjs/useNodesStateSynced";
import { IntegrationNode, ArktIntegrationNodeData } from "./type";

export const useIntegrationNodeControls = (id: string) => {
    const [, setNodes,] = useNodesStateSynced();

    const onNodeUpdate = (nodeData: Partial<ArktIntegrationNodeData>) => {
        setNodes(nodes => {
            return nodes.map(node => {
                if (node.id === id && node.type === "integration") {
                    return { ...node, data: { ...node.data as ArktIntegrationNodeData, ...nodeData } } satisfies IntegrationNode;
                }
                return node;
            });
        })
    };

    return {
        onNodeUpdate,
    };
};