"use client";

import { useEffect, useState } from "react";
import ydoc from "./ydoc";
import type { YMapEvent } from "yjs";
import { NodeUnion } from "../nodes/types";
import { ArktNode } from "../nodes/arkt/types";
import { FreehandNodeType } from "../nodes/freehand/types";

const nodesMap = ydoc.getMap<NodeUnion>("nodes");

// Type guards
function isArktNode(node: NodeUnion): node is ArktNode {
  return node.type === "arktNode";
}

function isFreehandNode(node: NodeUnion): node is FreehandNodeType {
  return node.type === "freehand";
}

export function useNodeById<T extends NodeUnion = NodeUnion>(nodeId?: string): T | undefined {
  const [node, setNode] = useState<NodeUnion | undefined>(() =>
    nodeId ? nodesMap.get(nodeId) : undefined
  );

  useEffect(() => {
    if (!nodeId) {
      setNode(undefined);
      return;
    }

    const update = () => {
      setNode(nodesMap.get(nodeId));
    };

    // initialize
    update();

    const observer = (event: YMapEvent<NodeUnion>) => {
      // Only update when the specific key changes
      if (event.keysChanged.has(nodeId)) {
        update();
      }
    };

    nodesMap.observe(observer);
    return () => {
      nodesMap.unobserve(observer);
    };
  }, [nodeId]);

  // Type-safe return using type guards
  if (node === undefined) {
    return undefined;
  }

  // For specific node types, use appropriate type guards
  if (isArktNode(node)) {
    return node as T;
  }
  
  if (isFreehandNode(node)) {
    return node as T;
  }

  // Fallback for unknown types or when T is NodeUnion
  return node as T;
}

export default useNodeById;


