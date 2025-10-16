import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";
import useNodesStateSynced from "../yjs/useNodesStateSynced";
import { useCommandStore } from "@/app/design/commandStore";
import { useListenToEscape } from "./useListenToEscape";

export const useDraggableNode = () => {
    const draggingNodesRef = useRef<string[]>([]);
    const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);
    const { screenToFlowPosition } = useReactFlow();
    const [, setNodes] = useNodesStateSynced()
    const addNodeCommand = useCommandStore((s) => s.commandMap["add-node"]);
    const draggingNodeCommand = useCommandStore((s) => s.commandMap["dragging-node"]);
    const { activateCommand, removeCommand } = useCommandStore()

    useListenToEscape(() => {
        if(draggingNodeCommand.status !== "pending") return;
        setNodes(nodes => nodes.filter(node => "isDraft" in node.data && !node.data.isDraft));
        removeCommand("dragging-node")
    });

    useEffect(() => {
        if (addNodeCommand.status === "pending") {
            setNodes(nodes => [...nodes, ...(addNodeCommand.data?.nodes || [])]);
            const nodes = addNodeCommand.data?.nodes;
            draggingNodesRef.current = nodes?.map(node => node.id) || [];
            removeCommand("add-node");
            const firstNode = nodes?.[0];
            const nodeType = firstNode && "virtualOf" in firstNode.data && firstNode?.data.virtualOf ? "virtual" : firstNode?.type || "arktNode";
            activateCommand("dragging-node", { type: nodeType })
            // Reset baseline so the first mouse move after adding nodes sets it
            lastMousePositionRef.current = null;
        }
    }, [addNodeCommand]);

    const mouseMoveHandler = (event: React.MouseEvent<HTMLDivElement>) => {
        if (draggingNodesRef.current.length === 0) return;

        const currentPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        // If we don't have a baseline yet, set it and skip moving to avoid jumping
        if (!lastMousePositionRef.current) {
            lastMousePositionRef.current = currentPosition;
            setNodes(nodes => {
                return nodes.map(node => {
                    if (draggingNodesRef.current.includes(node.id)) {
                        return {
                            ...node,
                            position: {
                                x: currentPosition.x - (node.width || 0) / 2,
                                y: currentPosition.y - (node.height || 0) / 2
                            }
                        }
                    }
                    return node;
                })
            })
            return;
        }

        const deltaX = currentPosition.x - lastMousePositionRef.current.x;
        const deltaY = currentPosition.y - lastMousePositionRef.current.y;

        if (deltaX === 0 && deltaY === 0) return;

        setNodes(nodes => {
            return nodes.map(node => {
                if (draggingNodesRef.current.includes(node.id)) {
                    return {
                        ...node,
                        position: {
                            x: node.position.x + deltaX,
                            y: node.position.y + deltaY
                        }
                    }
                }
                return node;
            })
        })

        // Update baseline to current for next move
        lastMousePositionRef.current = currentPosition;
    }

    const dropHandler = () => {
        draggingNodesRef.current = [];
        // make node status draft to false 
        setNodes(nodes => nodes.map(node => {
            if (node.type !== "arktNode") return node;

            return ({
                ...node,
                data: { ...node.data, isDraft: false }
            })
        }));
        removeCommand("dragging-node")
    }


    return {
        draggingNodesRef,
        mouseMoveHandler,
        dropHandler
    }
}
