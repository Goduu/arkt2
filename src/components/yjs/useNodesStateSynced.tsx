import { useCallback, useEffect, useState } from 'react';
import {
  type OnNodesChange,
  applyNodeChanges,
  getConnectedEdges,
} from '@xyflow/react';

import ydoc from './ydoc';
import { edgesMap } from './useEdgesStateSynced';
import { NodeUnion } from '../nodes/types';
import useUserDataStateSynced from './useUserStateSynced';
import { DEFAULT_PATH_ID } from './constants';

// We are using nodesMap as the one source of truth for the nodes.
// This means that we are doing all changes to the nodes in the map object.
// Whenever the map changes, we update the nodes state.
export const nodesMap = ydoc.getMap<NodeUnion>('nodes');

function useNodesStateSynced(): [
  NodeUnion[],
  React.Dispatch<React.SetStateAction<NodeUnion[]>>,
  OnNodesChange<NodeUnion>
] {
  const { currentUserData } = useUserDataStateSynced();
  const currentDiagramId = currentUserData?.currentDiagramId || DEFAULT_PATH_ID

  const [nodes, setNodes] = useState<NodeUnion[]>([]);

  const setNodesSynced = useCallback(
    (nodesOrUpdater: React.SetStateAction<NodeUnion[]>) => {
      const seen = new Set<string>();
      const next =
        typeof nodesOrUpdater === 'function'
          ? nodesOrUpdater([...nodesMap.values()])
          : nodesOrUpdater;

      for (const node of next) {
        seen.add(node.id);
        nodesMap.set(node.id, node);
      }

      for (const node of nodesMap.values()) {
        if (!seen.has(node.id)) {
          nodesMap.delete(node.id);
        }
      }
    },
    []
  );

  const getChildrenNodes = (nodeId: string, visited?: Set<string>, allNodesParam?: NodeUnion[]): NodeUnion[] => {
    const allNodes = allNodesParam ?? Array.from(nodesMap.values());
    const seen = visited ?? new Set<string>();

    if (seen.has(nodeId)) {
      return [];
    }
    seen.add(nodeId);

    const directChildren = allNodes.filter(
      (node) => node.id !== nodeId && node.data.pathId.includes(nodeId)
    );

    const descendants: NodeUnion[] = [];

    for (const child of directChildren) {
      if (!seen.has(child.id)) {
        descendants.push(child);
        const childDescendants = getChildrenNodes(child.id, seen, allNodes);
        if (childDescendants.length > 0) {
          descendants.push(...childDescendants);
        }
      }
    }

    return descendants;
  }

  // The onNodesChange callback updates nodesMap.
  // When the changes are applied to the map, the observer will be triggered and updates the nodes state.
  const onNodesChanges: OnNodesChange<NodeUnion> = useCallback((changes) => {
    const nodes = Array.from(nodesMap.values());
    const nextNodes = applyNodeChanges<NodeUnion>(changes, nodes);

    for (const change of changes) {
      if (change.type === 'add' || change.type === 'replace') {
        nodesMap.set(change.item.id, change.item);
      } else if (change.type === 'remove' && nodesMap.has(change.id)) {
        const deletedNode = nodesMap.get(change.id)!;
        const deletedChildrenNodes = getChildrenNodes(change.id);
        const allDeletedNodes = [...deletedChildrenNodes, deletedNode];
        const connectedEdges = getConnectedEdges(
          allDeletedNodes,
          [...edgesMap.values()]
        );
        allDeletedNodes.forEach(node => {
          nodesMap.delete(node.id);
        });

        for (const edge of connectedEdges) {
          edgesMap.delete(edge.id);
        }
      } else {
        const updatedNode = nextNodes.find((n) => n.id === change.id);
        if (updatedNode) {
          nodesMap.set(change.id, updatedNode);
        }
      }
    }
  }, []);

  // here we are observing the nodesMap and updating the nodes state whenever the map changes.
  useEffect(() => {
    const observer = () => {
      const nodeIdSet = new Set(Array.from(nodesMap.values()).filter(node => node.data.pathId === currentDiagramId).map(node => node.id));
      const nodesList = Array.from(nodeIdSet).map(id => nodesMap.get(id)).filter(n => n !== undefined);
      // const nodesList = Array.from(nodesMap.values()).filter(
      //   (node) => node && node.id && node.id.startsWith(`${currentDiagramId}//`)
      // );
      setNodes(nodesList);
    };

    const initialNodes = Array.from(nodesMap.values()).filter(
      (node) => node && node.id && node.data.pathId === currentDiagramId
    );
    setNodes(initialNodes);
    nodesMap.observe(observer);

    return () => nodesMap.unobserve(observer);
  }, [setNodes, currentDiagramId]);

  return [nodes, setNodesSynced, onNodesChanges];
}

export default useNodesStateSynced;
