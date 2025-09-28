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

export const HomeGithub = () => {

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
    getExampleNode({ id: "page", position: { x: 0, y: 0 }, label: "Home Page", templateData: templates.page }),
    getExampleNode({ id: "github", position: { x: 200, y: 15 }, label: "Github", type: "integration" }),
];


const startEdges: ArktEdge[] = [
    getExampleEdge({ id: "1", direction: "end", source: "page", target: "github", label: "code" }),
];