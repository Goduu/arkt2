import useNodesStateSynced from "../../yjs/useNodesStateSynced";
import { ArktFreehandNodeData, FreehandNodeType } from "./types";

export const useFreeHandNodeControls = (id: string) => {
    const [, setNodes,] = useNodesStateSynced();

    const onNodeUpdate = (nodeData: Partial<ArktFreehandNodeData>) => {
        setNodes(nodes => {
            return nodes.map(node => {
                if (node.id === id && node.type === "freehand") {
                    return { ...node, data: { ...node.data as ArktFreehandNodeData, ...nodeData } } satisfies FreehandNodeType;
                }
                return node;
            });
        })
    };

    return {
        onNodeUpdate,
    };
};