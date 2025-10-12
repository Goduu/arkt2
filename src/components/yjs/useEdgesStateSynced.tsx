import { useCallback, useEffect, useState } from 'react';
import { type OnEdgesChange, applyEdgeChanges } from '@xyflow/react';

import ydoc from './ydoc';
import { syncYMapFromState } from './mapSync';
import { ArktEdge } from '../edges/ArktEdge/type';
import { DEFAULT_PATH_ID } from './constants';
import { useUserData } from './UserDataContext';

// Please see the comments in useNodesStateSynced.ts.
// This is the same thing but for edges.
export const edgesMap = ydoc.getMap<ArktEdge>('edges');

function useEdgesStateSynced(): [
  ArktEdge[],
  React.Dispatch<React.SetStateAction<ArktEdge[]>>,
  OnEdgesChange<ArktEdge>
] {
  const [edges, setEdges] = useState<ArktEdge[]>([]);
  // Context may be undefined on landing page or non-collaborative views
  const userData = useUserData();
  const currentDiagramId = userData?.currentUserData?.currentDiagramId || DEFAULT_PATH_ID

  const setEdgesSynced = useCallback(
    (edgesOrUpdater: React.SetStateAction<ArktEdge[]>) => {
      try {
        const next =
          typeof edgesOrUpdater === 'function'
            ? edgesOrUpdater([...edgesMap.values()])
            : edgesOrUpdater;

        syncYMapFromState(edgesMap, next, 'edges-sync');
      } catch (error) {
        console.error('Error syncing edges:', error);
      }
    },
    []
  );

  const onEdgesChange: OnEdgesChange<ArktEdge> = useCallback((changes) => {
    try {
      const edges = Array.from(edgesMap.values());
      const nextEdges = applyEdgeChanges(changes, edges);

      for (const change of changes) {
        if (change.type === 'add' || change.type === 'replace') {
          edgesMap.set(change.item.id, change.item);
        } else if (change.type === 'remove' && edgesMap.has(change.id)) {
          edgesMap.delete(change.id);
        } else {
          const updatedEdge = nextEdges.find((e) => e.id === change.id);
          if (updatedEdge) {
            edgesMap.set(change.id, updatedEdge);
          }
        }
      }
    } catch (error) {
      console.error('Error processing edge changes:', error);
    }
  }, []);

  useEffect(() => {
    const observer = (event: import('yjs').YMapEvent<ArktEdge>) => {
      try {
        // Optimization: Only recompute if relevant keys changed
        let hasRelevantChange = false;
        
        for (const key of event.keysChanged) {
          const edge = edgesMap.get(key);
          if (edge?.data?.pathId === currentDiagramId) {
            hasRelevantChange = true;
            break;
          }
          // Also check if an edge was deleted that belonged to current diagram
          if (event.changes.keys.get(key)?.action === 'delete') {
            hasRelevantChange = true;
            break;
          }
        }
        
        if (!hasRelevantChange) return;
        
        const edgesList = Array.from(edgesMap.values()).filter(
          (edge) => edge && edge.data?.pathId === currentDiagramId
        );

        setEdges(edgesList);
      } catch (error) {
        console.error('Error in edges observer:', error);
      }
    };

    const initialEdges = Array.from(edgesMap.values()).filter(
      (edge) => edge && edge.id && edge.data?.pathId === currentDiagramId
    );
    setEdges(initialEdges);
    edgesMap.observe(observer);

    return () => edgesMap.unobserve(observer);
  }, [setEdges, currentDiagramId]);

  return [edges, setEdgesSynced, onEdgesChange];
}

export default useEdgesStateSynced;
