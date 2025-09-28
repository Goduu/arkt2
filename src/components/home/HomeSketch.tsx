"use client";

import { edgeTypes, nodeTypes } from "@/app/design/FlowEditor";
import { addEdge, Connection, ConnectionMode, ReactFlow, useEdgesState, useNodesState, useUpdateNodeInternals } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getExampleEdge, getExampleNode, templates } from "./utils";
import { ArktEdge } from "../edges/ArktEdge/type";
import { NodeUnion } from "../nodes/types";
import { useCallback, useEffect } from "react";
import { DEFAULT_ALGORITHM } from "../edges/ArktEdge/constants";
import { DEFAULT_STROKE_COLOR } from "../colors/utils";

export const HomeSketch = () => {

    const [nodes, , onNodesChange] = useNodesState(startNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(startEdges);
    const updateNodeInternals = useUpdateNodeInternals();

    const onConnect = useCallback(
        (connection: Connection) => {
            const edge: ArktEdge = {
                ...connection,
                id: `${Date.now()}-${connection.source}-${connection.target}`,
                type: 'arktEdge',
                selected: true,
                data: {
                    algorithm: DEFAULT_ALGORITHM,
                    pathId: "example",
                    strokeColor: DEFAULT_STROKE_COLOR,
                    strokeWidth: 2,
                    fontSize: 12,
                    labelFill: { family: "base", indicative: "low" },
                    direction: "none",
                    points: [],
                },
            };
            setEdges((eds) => addEdge(edge, eds));
        },
        [setEdges],
    );

    useEffect(() => {
        nodes.forEach((node) => {
            updateNodeInternals(node.id);
        });
    }, [nodes]);

    return (
        <div className="h-44 w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onConnect={onConnect}
                connectionMode={ConnectionMode.Loose}
                fitView
                fitViewOptions={{ padding: 0.05 }}
                proOptions={{ hideAttribution: true }}
            >
            </ReactFlow>
        </div>
    );
};

const startNodes: NodeUnion[] = [
    getExampleNode({ id: "arkt", position: { x: 0, y: 0 }, label: "ArkT", templateData: templates.page, width: 70, height: 50 }),
    getExampleNode({ id: "secure-environment", position: { x: 180, y: 0 }, label: "Secure Environment", templateData: templates.gateway, width: 145, height: 50 }),
];


const startEdges: ArktEdge[] = [
    getExampleEdge({ id: "1", direction: "end", source: "arkt", target: "secure-environment", label: "has" }),
];