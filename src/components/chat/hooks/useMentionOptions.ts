"use client";

import { useMemo } from "react";
import { MentionOption } from "../chatHistory/types";
import useNodesStateSynced from "@/components/yjs/useNodesStateSynced";

export function useMentionOptions(currentDiagramId: string | undefined): MentionOption[] {
  const [nodes] = useNodesStateSynced();
  return useMemo<MentionOption[]>(() => {
   
    return nodes.filter((node) => node.type === "arktNode" && !node.data.virtualOf).map((node) => ({ id: node.id, label: "label" in node.data ? node.data.label : "" }));
  }, [currentDiagramId]);
}


