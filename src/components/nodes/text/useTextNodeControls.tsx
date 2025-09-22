import useNodesStateSynced from "../../yjs/useNodesStateSynced";
import { ArktTextNode, ArktTextNodeData } from "./types";

export const useTextNodeControls = (id: string) => {
    const [, setNodes,] = useNodesStateSynced();

    const onNodeUpdate = (nodeData: Partial<ArktTextNodeData>) => {
        setNodes(nodes => {
            return nodes.map(node => {
                if (node.id === id && node.type === "text") {
                    return { ...node, data: { ...node.data as ArktTextNodeData, ...nodeData } } satisfies ArktTextNode;
                }
                return node;
            });
        })
    };

    return {
        onNodeUpdate,
    };
};