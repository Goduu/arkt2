import useNodesStateSynced from "../../yjs/useNodesStateSynced";

export const useNodeControls = (id: string) => {
    const [, setNodes,] = useNodesStateSynced();

    const onLabelChange = (label: string) => {
        setNodes(nodes => {
            return nodes.map(node => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, label } };
                }
                return node;
            });
        })
    };

    return {
        onLabelChange,
    };
};