"use client";

import { useEffect } from "react";
import { UIMessage } from "ai";
import useNodesStateSynced from "../yjs/useNodesStateSynced";
import useEdgesStateSynced from "../yjs/useEdgesStateSynced";
import { useChatStore } from "@/app/design/chatStore";
import useTemplatesStateSynced from "../yjs/useTemplatesStateSynced";

type ToolEvent = { name?: string; atMs?: number; result?: unknown };

export function useAiCreateStreaming(params: {
    sdkMessages: Array<UIMessage> | undefined;
    toolEvents: ToolEvent[] | undefined;
    endedAt: number | null | undefined;
    assistantChatIdRef: React.RefObject<string | null>;
    assistantMsgIdRef: React.RefObject<string | null>;
}) {
    const { sdkMessages, assistantChatIdRef, assistantMsgIdRef } = params;
    const [, setNodes] = useNodesStateSynced();
    const [, setEdges] = useEdgesStateSynced();
    const [templates] = useTemplatesStateSynced();

    function isRawDiagramInput(value: unknown): value is RawDiagramInput {
        if (typeof value !== "object" || value === null) return false;
        const v = value as Record<string, unknown>;
        const nodesOk = typeof v.nodes === "undefined" || Array.isArray(v.nodes);
        const edgesOk = typeof v.edges === "undefined" || Array.isArray(v.edges);
        return nodesOk && edgesOk;
    }


    useEffect(() => {
        const setLayout = async () => {
            const lastMessage = sdkMessages?.[sdkMessages.length - 1];
            if (lastMessage?.role !== 'assistant') return;

            const chatId = assistantChatIdRef.current;
            const msgId = assistantMsgIdRef.current;
            if (!chatId || !msgId) return;

            const state = useAppStore.getState();
            const chat = state.aiChats[chatId];
            const persistedTag = chat?.messages.find(m => m.id === msgId)?.tag;
            if (persistedTag !== "Create") return;

            const lastMessagePart = lastMessage.parts?.find((p) => p.type === 'text');
            if (lastMessagePart?.state === "done") {
                try {
                    const parsed: unknown = JSON.parse(lastMessagePart.text ?? '{}');
                    const input: RawDiagramInput = isRawDiagramInput(parsed) ? parsed : { nodes: [], edges: [] };
                    const { nodes, edges } = await normalizeDiagramInput(input, nodeTemplates: templates);

                    const clipboardGroup = createClipboardGroup(nodes, edges, diagrams[currentDiagramId]);
                    if (clipboardGroup) {
                        clipboardGroupRef.current = clipboardGroup;
                        const { draftNodes, draftIds } = createDraftNodesFromClipboard(clipboardGroup);
                        draftNodeIdsRef.current = draftIds;
                        setIsPasteMode(true);
                        setNodes((prev) => {
                            const filtered = filterDraftNodes(prev);
                            return [...filtered, ...draftNodes];
                        });
                        setEdges(prev => [...prev, ...edges]);
                    }
                } catch (error) {
                    console.error("error parsing json", error);
                }
            }
        }
        setLayout();
    }, [sdkMessages]);

}




