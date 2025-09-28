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

export const HomeExample = () => {

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
        <div className="h-80 w-full">
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
    getExampleNode({ id: "customer", position: { x: 0, y: 0 }, label: "Customer", templateData: templates.user }),
    getExampleNode({ id: "web-store", position: { x: 160, y: 100 }, label: "Web Store", templateData: templates.page }),
    getExampleNode({ id: "shopping-cart", position: { x: 150, y: -40 }, label: "Shopping Cart", templateData: templates.page }),
    getExampleNode({ id: "inventory-system", position: { x: 320, y: 50 }, label: "Inventory System", templateData: templates.database }),
    getExampleNode({ id: "payment-gateway", position: { x: 330, y: -50 }, label: "Payment Gateway", templateData: templates.gateway }),
    getExampleNode({ id: "github", position: { x: 60, y: -60 }, label: "Github", type: "integration" }),
];


const startEdges: ArktEdge[] = [
    getExampleEdge({ id: "1", direction: "end", source: "customer", target: "web-store", label: "browses" }),
    getExampleEdge({ id: "0", direction: "end", source: "customer", target: "shopping-cart" }),
    getExampleEdge({ id: "2", direction: "end", source: "web-store", target: "shopping-cart", label: "adds to" }),
    getExampleEdge({ id: "3", direction: "end", source: "shopping-cart", target: "inventory-system", label: "checks" }),
    getExampleEdge({ id: "4", direction: "end", source: "shopping-cart", target: "payment-gateway", label: "pays" }),
];