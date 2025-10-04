"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import useNodesStateSynced from "../yjs/useNodesStateSynced";
import useEdgesStateSynced from "../yjs/useEdgesStateSynced";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";
import { useChatStore } from "@/app/design/chatStore";
import { useUserDataStateSynced } from "../yjs/useUserStateSynced";
import { DEFAULT_STROKE_COLOR } from "../colors/utils";
import { DEFAULT_ALGORITHM } from "../edges/ArktEdge/constants";
import type { ArktNode } from "../nodes/arkt/types";
import type { ArktEdge } from "../edges/ArktEdge/type";
import { useNewDraftNode } from "../nodes/arkt/utils";
import type { TemplateData } from "../templates/types";
import type { CreateDiagramOutput } from "@/lib/ai/tools/createDiagramTool";
import { useCommandStore } from "@/app/design/commandStore";
import { ArktUIMessage } from "@/lib/ai/aiTypes";

type ToolEvent = { name?: string; atMs?: number; result?: unknown };

type CreateNodeInput = {
    id?: string;
    type: string;
    data: {
        label: string;
        description: string;
        pathId?: string;
        templateId?: string;
        virtualOf?: string;
    };
};

type CreateEdgeInput = {
    source: string;
    target: string;
    data: { label: string };
};

function isCreateDiagramOutput(value: unknown): value is CreateDiagramOutput {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    const nodesOk = Array.isArray((v as { nodes?: unknown[] }).nodes);
    const edgesOk = Array.isArray((v as { edges?: unknown[] }).edges);
    return nodesOk && edgesOk;
}

export function useAiCreateStreaming(params: {
    sdkMessages: Array<ArktUIMessage> | undefined;
    toolEvents: ToolEvent[] | undefined;
    endedAt: number | null | undefined;
    assistantChatIdRef: MutableRefObject<string | null>;
    assistantMsgIdRef: MutableRefObject<string | null>;
}) {
    const { sdkMessages, assistantChatIdRef, assistantMsgIdRef } = params;
    const [, setNodes] = useNodesStateSynced();
    const [, setEdges] = useEdgesStateSynced();
    const [templates] = useTemplatesStateSynced();
    const { currentUserData } = useUserDataStateSynced();
    const processedMsgRef = useRef<string | null>(null);
    const { getNewDraftArktNode: getNewDraftNode } = useNewDraftNode();
    const activateCommand = useCommandStore((s) => s.activateCommand);

    useEffect(() => {
        const lastMessage = sdkMessages?.[sdkMessages.length - 1];
        if (!lastMessage || lastMessage.role !== "assistant") return;

        const chatId = assistantChatIdRef.current;
        const msgId = assistantMsgIdRef.current;
        if (!chatId || !msgId) return;

        // Avoid double-processing the same assistant message
        if (processedMsgRef.current === msgId) return;

        const state = useChatStore.getState();
        const chat = state.aiChats[chatId];
        const persistedTag = chat?.messages.find((m) => m.id === msgId)?.tag;
        if (persistedTag !== "Create") return;

        const lastMessagePart = lastMessage.parts?.find((p) => p.type === "text");
        if (!lastMessagePart || lastMessagePart.state !== "done") return;

        try {
            const parsed: unknown = JSON.parse(lastMessagePart.text ?? "{}");
            if (!isCreateDiagramOutput(parsed)) return;

            const output = parsed;
            const basePathId = output.initialDiagramId || currentUserData?.currentDiagramId || "";

            // Build nodes using defaults and template info
            const labelToId = new Map<string, string>();
            const createdNodes: ArktNode[] = [];
            const tempIdToRealId = new Map<string, string>();
            const templateById = new Map<string, TemplateData>();
            for (const t of templates) templateById.set(t.id, t);

            const gridColCount = 4;
            const cellW = 140;
            const cellH = 100;
            let index = 0;

            for (const n of output.nodes as CreateNodeInput[]) {
                if (!n || typeof n !== "object" || typeof n.data?.label !== "string") continue;
                const tpl = n.data.templateId ? templateById.get(n.data.templateId) : undefined;
                const draft = getNewDraftNode(tpl);
                const row = Math.floor(index / gridColCount);
                const col = index % gridColCount;
                index += 1;

                const pathId = n.data.pathId && n.data.pathId.length > 0 ? n.data.pathId : basePathId;

                const node: ArktNode = {
                    ...draft,
                    position: { x: col * cellW, y: row * cellH },
                    data: {
                        ...draft.data,
                        pathId,
                        label: n.data.label,
                        description: n.data.description ?? "",
                        templateId: n.data.templateId ?? draft.data.templateId,
                        isDraft: false,
                    },
                };

                if (typeof n.data.virtualOf === "string" && n.data.virtualOf.length > 0) {
                    // Resolve by label if it refers to a newly created node
                    const resolvedId = labelToId.get(n.data.virtualOf);
                    if (resolvedId) {
                        node.data = { ...node.data, virtualOf: resolvedId };
                    }
                }

                createdNodes.push(node);
                labelToId.set(n.data.label, node.id);
                if (typeof n.id === "string" && n.id.length > 0) {
                    tempIdToRealId.set(n.id, node.id);
                }
            }

            // Remap each node's pathId if it points to a temporary id
            for (const node of createdNodes) {
                const mappedPathId = tempIdToRealId.get(node.data.pathId);
                if (mappedPathId) {
                    node.data = { ...node.data, pathId: mappedPathId };
                }
            }

            // Remap each node's virtualOf if it points to a temporary id or label
            for (const node of createdNodes) {
                const v = node.data.virtualOf;
                if (!v) continue;
                const mappedByLabel = labelToId.get(v);
                const mappedByTemp = tempIdToRealId.get(v);
                const resolvedId = mappedByLabel || mappedByTemp;
                if (resolvedId) {
                    node.data = { ...node.data, virtualOf: resolvedId };
                }
            }

            // Build edges by connecting nodes created above
            const createdEdges: ArktEdge[] = [];
            for (const e of output.edges as CreateEdgeInput[]) {
                if (!e || typeof e.source !== "string" || typeof e.target !== "string") continue;
                const sourceId = labelToId.get(e.source);
                const targetId = labelToId.get(e.target);
                const pathId = createdNodes.find((n) => n.data.label === e.source)?.data.pathId || basePathId;
                if (!sourceId || !targetId) continue;

                const edge: ArktEdge = {
                    id: `${Date.now()}-${sourceId}-${targetId}`,
                    source: sourceId,
                    target: targetId,
                    type: "arktEdge",
                    data: {
                        algorithm: DEFAULT_ALGORITHM,
                        direction: "none",
                        pathId: pathId,
                        strokeColor: DEFAULT_STROKE_COLOR,
                        strokeWidth: 2,
                        fontSize: 12,
                        labelFill: { family: "base", indicative: "low" },
                        label: e.data?.label ?? "",
                        points: [],
                    },
                    selected: false,
                };

                createdEdges.push(edge);
            }

            // Append to state
            if (createdEdges.length > 0) {
                setEdges((prev) => [...prev, ...createdEdges]);
            }
            if (createdNodes.length > 0) {
                activateCommand("add-node", { nodes: createdNodes });
            }

            processedMsgRef.current = msgId;
        } catch (error) {
            console.error("AI create: failed to parse/apply output", error);
        }
    }, [sdkMessages, templates, setNodes, setEdges, assistantChatIdRef, assistantMsgIdRef, currentUserData]);
}




