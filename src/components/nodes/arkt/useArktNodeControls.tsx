import useNodesStateSynced from "../../yjs/useNodesStateSynced";
import { ArktNode, ArktNodeData } from "./types";

export const useArktNodeControls = (id: string) => {
    const [, setNodes,] = useNodesStateSynced();

    const onNodeUpdate = (nodeData: Partial<ArktNodeData>) => {
        setNodes(nodes => {
            return nodes.map(node => {
                if (node.id === id && node.type === "arktNode") {
                    return { ...node, data: { ...node.data as ArktNodeData, ...nodeData } } satisfies ArktNode;
                }
                return node;
            });
        })
    };

    return {
        onNodeUpdate,
    };
};