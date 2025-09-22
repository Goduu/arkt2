import { useCallback, useEffect, useMemo, useState } from 'react';

import ydoc from './ydoc';
import { getAncestorIdsFromNode, getNodePathLabelsFromId } from './nodePathUtils';
import { NodeUnion } from '../nodes/types';
import { ArktNode } from '../nodes/arkt/types';
import { FitView } from '@xyflow/react';

const usersDataMap = ydoc.getMap<UserData>('usersData');

const MAX_IDLE_TIME = 60000;

export type UserData = {
  id: string;
  currentDiagramId: string,
  currentDiagramPath: {
    id: string;
    label: string;
  }[]
  timestamp: number;
};

export function useUserDataStateSynced(fitView?: FitView) {
  const [usersData, setUsersData] = useState<UserData[]>([]);

  // Flush any data that have gone stale.
  const flush = useCallback(() => {
    const now = Date.now();

    for (const [id, userData] of usersDataMap) {
      if (now - userData.timestamp > MAX_IDLE_TIME && id !== ydoc.clientID.toString()) {
        usersDataMap.delete(id);
      }
    }
  }, []);

  const onChangeNodeLabel = useCallback((nodeId: string, label: string) => {
    const currentUserData = usersDataMap.get(ydoc.clientID.toString());
    if (currentUserData) {
      currentUserData.currentDiagramPath.forEach(path => {
        if (path.id === nodeId) {
          path.label = label;
        }
      });
      usersDataMap.set(ydoc.clientID.toString(), currentUserData);
    }
  }, []);

  const onDiagramDrillDown = useCallback(
    (newDiagramId: string, newDiagramLabel: string) => {
      const currentUserData = usersDataMap.get(ydoc.clientID.toString());
      if (currentUserData) {
        currentUserData.currentDiagramPath.push({ id: newDiagramId, label: newDiagramLabel });
      }

      usersDataMap.set(ydoc.clientID.toString(), {
        id: ydoc.clientID.toString(),
        currentDiagramId: newDiagramId,
        currentDiagramPath: currentUserData?.currentDiagramPath || [{ id: newDiagramId, label: newDiagramLabel }],
        timestamp: Date.now(),
      });
      fitView?.();
    },
    []
  );

  const onDiagramDrillUp = useCallback(() => {
    const currentUserData = usersDataMap.get(ydoc.clientID.toString());
    if (currentUserData) {
      currentUserData.currentDiagramPath.pop();
    }
    usersDataMap.set(ydoc.clientID.toString(), {
      id: ydoc.clientID.toString(),
      currentDiagramId: currentUserData?.currentDiagramPath[currentUserData?.currentDiagramPath.length - 1].id ?? "",
      currentDiagramPath: currentUserData?.currentDiagramPath || [],
      timestamp: Date.now(),
    });
    fitView?.();
  }, []);

  // Drill to a specific index within the currentDiagramPath array (inclusive)
  const onDiagramDrillToIndex = useCallback((index: number) => {
    const currentUserData = usersDataMap.get(ydoc.clientID.toString());
    const safe = Math.max(0, index);
    if (currentUserData && Array.isArray(currentUserData.currentDiagramPath) && currentUserData.currentDiagramPath.length > 0) {
      const nextPath = currentUserData.currentDiagramPath.slice(0, safe + 1);
      const last = nextPath[nextPath.length - 1];
      usersDataMap.set(ydoc.clientID.toString(), {
        id: ydoc.clientID.toString(),
        currentDiagramId: last?.id ?? "",
        currentDiagramPath: nextPath,
        timestamp: Date.now(),
      });
      fitView?.();
      return;
    }
    // If we don't have user data yet, no-op
  }, []);

  // Drill directly to a node by id, rebuilding full path from home (excluding the home segment itself)
  const onDiagramDrillToNode = useCallback((targetNodeId: string) => {
    const nodesMap = ydoc.getMap<NodeUnion>('nodes');

    const node = nodesMap.get(targetNodeId);
    const isArktNode = (n: NodeUnion | undefined): n is ArktNode => !!n && (n as ArktNode).type === 'arktNode';
    if (!isArktNode(node)) return;

    const ancestorIds = getAncestorIdsFromNode(node); // [parentId, grandParentId, ...]
    const labelsAll = getNodePathLabelsFromId(targetNodeId); // [DEFAULT, rootLabel, ..., parentLabel, nodeLabel]

    // Exclude DEFAULT and the current node label for ancestor labels
    const ancestorLabelsRootToParent = labelsAll.slice(1, -1); // [rootLabel, ..., parentLabel]
    const ancestorIdsRootToParent = [...ancestorIds].reverse(); // [rootAncestorId, ..., parentId]

    const ancestorPairs = ancestorIdsRootToParent.map((id, idx) => ({ id, label: ancestorLabelsRootToParent[idx] }));
    const currentPair = { id: targetNodeId, label: labelsAll[labelsAll.length - 1] };
    const fullPath = [...ancestorPairs, currentPair];

    usersDataMap.set(ydoc.clientID.toString(), {
      id: ydoc.clientID.toString(),
      currentDiagramId: targetNodeId,
      currentDiagramPath: fullPath,
      timestamp: Date.now(),
    });
    fitView?.();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(flush, MAX_IDLE_TIME);
    const observer = () => {
      setUsersData([...usersDataMap.values()]);
    };

    flush();
    setUsersData([...usersDataMap.values()]);
    usersDataMap.observe(observer);

    return () => {
      usersDataMap.unobserve(observer);
      window.clearInterval(timer);
    };
  }, [flush]);

  const currentUserData = useMemo(() => {
    const data = usersData.find((userData) => userData.id === ydoc.clientID.toString());
    return data;
  }, [usersData]);

  return {
    currentUserData,
    usersData,
    onDiagramDrillDown,
    onDiagramDrillUp,
    onDiagramDrillToIndex,
    onChangeNodeLabel,
    onDiagramDrillToNode
  }
}

export default useUserDataStateSynced;
