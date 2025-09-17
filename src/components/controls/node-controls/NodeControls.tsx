"use client";

import { BasicNodeControl } from "./BasicNodeControl";
import { ControlWrapper } from "../ControlWrapper";
import useNodesStateSynced from "@/components/yjs/useNodesStateSynced";
import { ArktNodeData } from "@/components/nodes/arkt/types";

export function NodeControls() {
  const [nodes, setNodes] = useNodesStateSynced();
  const selectedNodes = nodes.filter((node) => node.selected);
  const selectedNode = selectedNodes[0];
  const isBasicNode = selectedNode?.type === "arktNode"

  const handleNodeChange = (next: Partial<ArktNodeData> | undefined) => {
    if (!next) return;
    console.log("handleNodeChange", next);
    setNodes((nodes) => nodes.map((n) => {
      if (!n.id || !selectedNode.id || n.type !== "arktNode") return n;
      if (n.id === selectedNode.id) {
        return { ...n, data: { ...n.data, ...next } }
      }
      return n;
    }))
  }

  if (!selectedNode) return null;
  return (
    <ControlWrapper title="Node options" testId="node-options">
      {isBasicNode && (
        <BasicNodeControl
          node={selectedNode}
          onChange={handleNodeChange}
        />
      )}
    </ControlWrapper>

  );
}


