import { useCallback, useEffect, useState } from 'react';
import {
  type OnNodesChange,
  applyNodeChanges,
  getConnectedEdges,
} from '@xyflow/react';

import ydoc, { awareness } from './ydoc';
import { syncYMapFromState } from './mapSync';
import { edgesMap } from './useEdgesStateSynced';
import { NodeUnion } from '../nodes/types';
import { DEFAULT_PATH_ID } from './constants';
import { useUserData } from './UserDataContext';

// We are using nodesMap as the one source of truth for the nodes.
// This means that we are doing all changes to the nodes in the map object.
// Whenever the map changes, we update the nodes state.
export const nodesMap = ydoc.getMap<NodeUnion>('nodes');

function useNodesStateSynced(): [
  NodeUnion[],
  React.Dispatch<React.SetStateAction<NodeUnion[]>>,
  OnNodesChange<NodeUnion>
] {
  // Context may be undefined on landing page or non-collaborative views
  const userData = useUserData();
  const currentDiagramId = userData?.currentUserData?.currentDiagramId || DEFAULT_PATH_ID

  const [nodes, setNodes] = useState<NodeUnion[]>([]);

  const setNodesSynced = useCallback(
    (nodesOrUpdater: React.SetStateAction<NodeUnion[]>) => {
      try {
        const next =
          typeof nodesOrUpdater === 'function'
            ? nodesOrUpdater([...nodesMap.values()])
            : nodesOrUpdater;

        syncYMapFromState(nodesMap, next, 'nodes-sync');
      } catch (error) {
        console.error('Error syncing nodes:', error);
      }
    },
    []
  );

  /**
   * Recursively gets all children nodes of a given node.
   * Uses a visited set to prevent infinite loops in case of circular references.
   */
  const getChildrenNodes = useCallback((nodeId: string, visited?: Set<string>, allNodesParam?: NodeUnion[]): NodeUnion[] => {
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
  }, []);

  // The onNodesChange callback updates nodesMap.
  // When the changes are applied to the map, the observer will be triggered and updates the nodes state.
  const onNodesChanges: OnNodesChange<NodeUnion> = useCallback((changes) => {
    try {
      const nodes = Array.from(nodesMap.values());
      const nextNodes = applyNodeChanges<NodeUnion>(changes, nodes);
      const localState = awareness.getLocalState()
      const currentSelection = new Set<string>(localState?.selection?.nodes ?? []);
      for (const change of changes) {
        if (change.type === 'add' || change.type === 'replace') {
          nodesMap.set(change.item.id, change.item);
        } else if (change.type === 'remove' && nodesMap.has(change.id)) {
          const deletedNode = nodesMap.get(change.id);
          if (!deletedNode) continue; // Handle race condition

          const deletedChildrenNodes = getChildrenNodes(change.id);
          const allDeletedNodes = [...deletedChildrenNodes, deletedNode];
          const connectedEdges = getConnectedEdges(
            allDeletedNodes,
            [...edgesMap.values()]
          );

          // Batch all deletions in a single transaction
          ydoc.transact(() => {
            allDeletedNodes.forEach(node => {
              nodesMap.delete(node.id);
            });

            for (const edge of connectedEdges) {
              edgesMap.delete(edge.id);
            }
          });
        } else if (change.type === "select") {
          if (change.selected) {
            currentSelection.add(change.id);
          } else {
            currentSelection.delete(change.id);
          }
          const updatedNode = nextNodes.find((n) => n.id === change.id);
          if (updatedNode) {
            nodesMap.set(change.id, updatedNode);
          }

          continue;
        } else {
          const updatedNode = nextNodes.find((n) => n.id === change.id);
          if (updatedNode) {
            nodesMap.set(change.id, updatedNode);
          }
        }
      }
      awareness.setLocalStateField('selection', { nodes: Array.from(currentSelection) });

    } catch (error) {
      console.error('Error processing node changes:', error);
    }
  }, [getChildrenNodes]);

  // Clear selection when changing diagrams to prevent stale selections
  useEffect(() => {
    awareness.setLocalStateField('selection', { nodes: [] });
  }, [currentDiagramId]);

  // here we are observing the nodesMap and updating the nodes state whenever the map changes.
  useEffect(() => {
    const observer = (event: import('yjs').YMapEvent<NodeUnion>) => {
      try {
        // Optimization: Only recompute if relevant keys changed
        let hasRelevantChange = false;

        for (const key of event.keysChanged) {
          const node = nodesMap.get(key);
          if (node?.data.pathId === currentDiagramId) {
            hasRelevantChange = true;
            break;
          }
          // Also check if a node was deleted that belonged to current diagram
          if (event.changes.keys.get(key)?.action === 'delete') {
            hasRelevantChange = true;
            break;
          }
        }

        if (!hasRelevantChange) return;

        const nodeIdSet = new Set(Array.from(nodesMap.values()).filter(node => node.data.pathId === currentDiagramId).map(node => node.id));
        const nodesList = Array.from(nodeIdSet).map(id => nodesMap.get(id)).filter(n => n !== undefined);
        setNodes(nodesList);
      } catch (error) {
        console.error('Error in nodes observer:', error);
      }
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
