import { useCallback, useEffect, useState } from 'react';
import {type OnEdgesChange, applyEdgeChanges } from '@xyflow/react';

import ydoc from './ydoc';
import { ArktEdge } from '../edges/ArktEdge/type';
import useUserDataStateSynced from './useUserStateSynced';
import { DEFAULT_PATH_ID } from './constants';

// Please see the comments in useNodesStateSynced.ts.
// This is the same thing but for edges.
export const edgesMap = ydoc.getMap<ArktEdge>('edges');

function useEdgesStateSynced(): [
  ArktEdge[],
  React.Dispatch<React.SetStateAction<ArktEdge[]>>,
  OnEdgesChange<ArktEdge>
] {
  const [edges, setEdges] = useState<ArktEdge[]>([]);
  const { currentUserData } = useUserDataStateSynced();
  const currentDiagramId = currentUserData?.currentDiagramId || DEFAULT_PATH_ID

  const setEdgesSynced = useCallback(
    (edgesOrUpdater: React.SetStateAction<ArktEdge[]>) => {
      const next =
        typeof edgesOrUpdater === 'function'
          ? edgesOrUpdater([...edgesMap.values()])
          : edgesOrUpdater;

      const seen = new Set<string>();

      for (const edge of next) {
        seen.add(edge.id);
        edgesMap.set(edge.id, edge);
      }

      for (const edge of edgesMap.values()) {
        if (!seen.has(edge.id)) {
          edgesMap.delete(edge.id);
        }
      }
    },
    []
  );

  const onEdgesChange: OnEdgesChange<ArktEdge> = useCallback((changes) => {
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
  }, []);

  useEffect(() => {
    const observer = () => {
      const edgesList = Array.from(edgesMap.values()).filter(
        (edge) => edge && edge.data?.pathId === currentDiagramId
      );

      setEdges(edgesList);
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
