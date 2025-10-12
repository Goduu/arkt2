'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { awareness } from './ydoc';
import { useSearchParams } from 'next/navigation';

export type ClientSelection = {
  clientId: string;
  name: string;
  color: string;
  nodeIds: Set<string>;
};

export type UseSelectionAwarenessResult = {
  // Nodes selected by this client
  localSelectedNodeIds: Set<string>;
  // Per-client remote selections (excluding self)
  remoteSelections: ClientSelection[];
  // Convenience index: for each nodeId, which clients select it
  selectedByNodeId: Map<string, ClientSelection[]>;
};

export function useSelectionAwareness(): UseSelectionAwarenessResult {
  const [version, setVersion] = useState(0);
  const lastResultRef = useRef<UseSelectionAwarenessResult | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const collab = searchParams.get("collab")

  // Compute function now reads awareness directly (not closed over stale reference)
  const compute = useCallback((): UseSelectionAwarenessResult => {
    const entries = Array.from(awareness.getStates().entries())
    const selfId = awareness.clientID.toString();

    const remoteSelections: ClientSelection[] = [];
    let localSelectedNodeIds: Set<string> = new Set();

    for (const [clientIdNum, state] of entries) {
      const clientId = clientIdNum.toString();
      const nodeIds = new Set<string>(state.selection?.nodes ?? []);
      const name = state.user?.name || `User-${clientId.slice(-4)}`;
      const color = state.user?.color || '#888888';

      if (clientId === selfId) {
        localSelectedNodeIds = nodeIds;
      } else if (nodeIds.size > 0) {
        remoteSelections.push({ clientId, name, color, nodeIds });
      }
    }

    // Build reverse index nodeId -> clients
    const selectedByNodeId = new Map<string, ClientSelection[]>();
    for (const cs of remoteSelections) {
      for (const nodeId of cs.nodeIds) {
        const list = selectedByNodeId.get(nodeId) ?? [];
        list.push(cs);
        selectedByNodeId.set(nodeId, list);
      }
    }

    return { localSelectedNodeIds, remoteSelections, selectedByNodeId };
  }, []);

  // Re-trigger version update when collab room changes to force recomputation
  useEffect(() => {
    setVersion((v) => v + 1);
  }, [collab]);

  useEffect(() => {
    // Debounce awareness changes to avoid excessive re-renders during rapid selections
    const onChange = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        setVersion((v) => v + 1);
      }, 16); // ~60fps, one frame delay
    };

    awareness.on('change', onChange);
    return () => {
      awareness.off('change', onChange);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [collab]); // Re-subscribe when collab changes (awareness instance changes)

  // Memoize result and check if meaningful change occurred
  return useMemo(() => {
    const newResult = compute();

    // Early exit if nothing changed (optimize re-renders)
    if (lastResultRef.current) {
      const prev = lastResultRef.current;
      const localUnchanged =
        prev.localSelectedNodeIds.size === newResult.localSelectedNodeIds.size &&
        Array.from(prev.localSelectedNodeIds).every(id => newResult.localSelectedNodeIds.has(id));

      // Compare remote selections by clientId, not by index position
      const prevClientsMap = new Map(prev.remoteSelections.map(s => [s.clientId, s]));
      const newClientsMap = new Map(newResult.remoteSelections.map(s => [s.clientId, s]));
      
      const remoteUnchanged =
        prev.remoteSelections.length === newResult.remoteSelections.length &&
        Array.from(prevClientsMap.keys()).every(clientId => {
          const prevSel = prevClientsMap.get(clientId);
          const newSel = newClientsMap.get(clientId);
          return newSel && prevSel &&
            prevSel.nodeIds.size === newSel.nodeIds.size &&
            Array.from(prevSel.nodeIds).every(id => newSel.nodeIds.has(id));
        });

      if (localUnchanged && remoteUnchanged) {
        return prev;
      }
    }

    lastResultRef.current = newResult;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('collab', newResult);
    }
    
    return newResult;
  }, [version, compute]);
}

export default useSelectionAwareness;


