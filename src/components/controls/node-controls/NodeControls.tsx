"use client";

import { BasicNodeControl } from "./BasicNodeControl";
import { ControlWrapper } from "../ControlWrapper";
import useNodesStateSynced from "@/components/yjs/useNodesStateSynced";
import { ArktNode, ArktNodeData } from "@/components/nodes/arkt/types";
import { TextNodeControls } from "./TextNodeControls";
import { ArktTextNode } from "@/components/nodes/text/types";
import { FreehandNodeControls } from "./FreehandNodeControls";
import { FreehandNodeType } from "@/components/nodes/freehand/types";
import { IntegrationsControl } from "./IntegrationsControl";
import { IntegrationNode } from "@/components/nodes/integrations/type";
import { NodeUnion } from "@/components/nodes/types";
import { memo } from "react";

type NodeControlsProps = {
  selectedNodes: NodeUnion[];
}

export const NodeControls = memo(({ selectedNodes }: NodeControlsProps) => {
  const selectedNode = selectedNodes[0];
  const [, setNodes,] = useNodesStateSynced();

  const handleNodeChange = (next: Partial<ArktNodeData> | undefined) => {
    if (!next) return;

    setNodes((nodes) => nodes.map((n) => {
      if (!n.id || !selectedNode.id || n.type !== "arktNode") return n;
      if (n.id !== selectedNode.id) return n;
      return { ...n, data: { ...n.data, ...next } }
    }))
  }

  const isVirtualNode = selectedNode?.data && "virtualOf" in selectedNode.data && selectedNode.data.virtualOf;

  if (!selectedNode || isVirtualNode) return null;
  console.log("selectedNodes",selectedNode);
  return (
    <ControlWrapper title="Node options" testId="node-controls" selectedNodes={selectedNodes}>
      {selectedNode?.type === "arktNode" && (
        <BasicNodeControl
          node={selectedNode as ArktNode}
          onChange={handleNodeChange}
        />
      )}
      {selectedNode?.type === "text" && (
        <TextNodeControls node={selectedNode as ArktTextNode} />
      )}
      {selectedNode?.type === "freehand" && (
        <FreehandNodeControls node={selectedNode as FreehandNodeType} />
      )}
      {selectedNode?.type === "integration" && (
        <IntegrationsControl node={selectedNode as IntegrationNode} />
      )}
    </ControlWrapper>
  )
});

NodeControls.displayName = "NodeControls";
