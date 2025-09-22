"use client";

import { useEffect, useState } from "react";
import ydoc from "./ydoc";
import { NodeUnion } from "../nodes/types";
import { ArktNode } from "../nodes/arkt/types";
import { edgesMap } from "./useEdgesStateSynced";

const nodesMap = ydoc.getMap<NodeUnion>("nodes");

function isArktNode(node: NodeUnion | undefined): node is ArktNode {
  return !!node && node.type === "arktNode";
}

function areNodeListsEqualById(a: NodeUnion[], b: NodeUnion[]): boolean {
  if (a.length !== b.length) return false;
  const aIds = new Set(a.map((n) => n.id));
  for (const node of b) {
    if (!aIds.has(node.id)) return false;
  }
  return true;
}

export function useNodeVirtualConnections(nodeId?: string): ArktNode[] {
  const [connectedNodes, setConnectedNodes] = useState<NodeUnion[]>([]);

  useEffect(() => {
    if (!nodeId) {
      setConnectedNodes([]);
      return;
    }

    const compute = (): NodeUnion[] => {
      // Find all virtual nodes whose data.virtualOf equals the provided nodeId
      const virtualNodeIds = new Set<string>();
      for (const node of nodesMap.values()) {
        if (isArktNode(node) && node.data.virtualOf === nodeId) {
          virtualNodeIds.add(node.id);
        }
      }

      if (virtualNodeIds.size === 0) return [];

      // Collect all nodes that are connected to any of the virtual nodes
      const connectedNodeIds = new Set<string>();
      for (const edge of edgesMap.values()) {
        if (!edge) continue;
        const { source, target } = edge;
        if (source && target) {
          if (virtualNodeIds.has(source) && !virtualNodeIds.has(target)) {
            connectedNodeIds.add(target);
          } else if (virtualNodeIds.has(target) && !virtualNodeIds.has(source)) {
            connectedNodeIds.add(source);
          }
        }
      }

      if (connectedNodeIds.size === 0) return [];

      const result: NodeUnion[] = [];
      for (const id of connectedNodeIds) {
        const node = nodesMap.get(id);
        if (node) result.push(node);
      }
      return result;
    };

    const update = () => {
      const next = compute();
      setConnectedNodes((prev) => (areNodeListsEqualById(prev, next) ? prev : next));
    };

    // Initialize
    update();

    const nodesObserver = () => {
      update();
    };
    const edgesObserver = () => {
      update();
    };

    nodesMap.observe(nodesObserver);
    edgesMap.observe(edgesObserver);
    return () => {
      nodesMap.unobserve(nodesObserver);
      edgesMap.unobserve(edgesObserver);
    };
  }, [nodeId]);

  return connectedNodes.filter(node => node.type === "arktNode") as ArktNode[];
}

export default useNodeVirtualConnections;