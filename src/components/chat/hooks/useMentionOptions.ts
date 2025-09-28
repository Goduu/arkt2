"use client";

import { MentionOption } from "../chatHistory/types";
import { NodeUnion } from "@/components/nodes/types";
import ydoc from "@/components/yjs/ydoc";

const nodesMap = ydoc.getMap<NodeUnion>("nodes");
export function useMentionOptions(): MentionOption[] {
  const nodes = Array.from(nodesMap.values()).filter((node) => node.type === "arktNode" && !node.data?.virtualOf)
  const nodeOptions = nodes.map((node) => ({ id: node.id, label: "label" in node.data ? node.data.label : "" }));
  return nodeOptions;
}


