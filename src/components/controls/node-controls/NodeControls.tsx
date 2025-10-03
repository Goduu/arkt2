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

export function NodeControls() {
  const [nodes, setNodes] = useNodesStateSynced();
  const selectedNodes = nodes.filter((node) => node.selected);
  const selectedNode = selectedNodes[0];
  const isArktNode = selectedNode?.type === "arktNode"
  const isArchTextNode = selectedNode?.type === "text"
  const isFreehandNode = selectedNode?.type === "freehand"
  const isIntegrationNode = selectedNode?.type === "integration"
  const handleNodeChange = (next: Partial<ArktNodeData> | undefined) => {
    if (!next) return;

    setNodes((nodes) => nodes.map((n) => {
      if (!n.id || !selectedNode.id || n.type !== "arktNode") return n;
      if (n.id === selectedNode.id) {
        return { ...n, data: { ...n.data, ...next } }
      }
      return n;
    }))
  }

  const isVirtualNode = selectedNode?.data && "virtualOf" in selectedNode.data && selectedNode.data.virtualOf;

  if (!selectedNode || isVirtualNode) return null;

  return (
    <ControlWrapper title="Node options" testId="node-controls">
      {isArktNode && (
        <BasicNodeControl
          node={selectedNode as ArktNode}
          onChange={handleNodeChange}
        />
      )}
      {isArchTextNode && (
        <TextNodeControls node={selectedNode as ArktTextNode} />
      )}
      {isFreehandNode && (
        <FreehandNodeControls node={selectedNode as FreehandNodeType} />
      )}
      {isIntegrationNode && (
        <IntegrationsControl node={selectedNode as IntegrationNode} />
      )}
    </ControlWrapper>

  );
}


