'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import ydoc from './ydoc';
import { getAncestorIdsFromNode, getNodePathLabelsFromId } from './nodePathUtils';
import { NodeUnion } from '../nodes/types';
import { ArktNode } from '../nodes/arkt/types';
import { FitView } from '@xyflow/react';
import { DEFAULT_PATH_ID, DEFAULT_PATH_LABEL } from './constants';

// Use Y.Map for diagram navigation - this is core app state, not ephemeral presence
const usersDataMap = ydoc.getMap<UserData>('usersData');

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

  type PathEntry = { id: string; label: string };

  const normalizePath = useCallback((incoming?: PathEntry[]): PathEntry[] => {
    const path = Array.isArray(incoming) ? incoming.filter(Boolean) : [];
    const withoutDefault = path.filter((p) => p.id !== DEFAULT_PATH_ID);
    return [{ id: DEFAULT_PATH_ID, label: DEFAULT_PATH_LABEL }, ...withoutDefault];
  }, []);

  const ensureInitial = useCallback(() => {
    const id = ydoc.clientID.toString();
    const existing = usersDataMap.get(id);
    if (!existing || !Array.isArray(existing.currentDiagramPath) || existing.currentDiagramPath.length === 0) {
      usersDataMap.set(id, {
        id,
        currentDiagramId: DEFAULT_PATH_ID,
        currentDiagramPath: [{ id: DEFAULT_PATH_ID, label: DEFAULT_PATH_LABEL }],
        timestamp: Date.now(),
      });
      return;
    }
    // Normalize in case it's missing the default at index 0
    const normalized = normalizePath(existing.currentDiagramPath);
    if (JSON.stringify(normalized) !== JSON.stringify(existing.currentDiagramPath) || !existing.currentDiagramId) {
      usersDataMap.set(id, {
        ...existing,
        currentDiagramId: existing.currentDiagramId || DEFAULT_PATH_ID,
        currentDiagramPath: normalized,
        timestamp: Date.now(),
      });
    }
  }, [normalizePath]);


  const onChangeNodeLabel = useCallback((nodeId: string, label: string) => {
    const currentUserData = usersDataMap.get(ydoc.clientID.toString());
    if (currentUserData) {
      // Create new array with updated path to avoid direct mutation
      const updatedPath = currentUserData.currentDiagramPath.map(path =>
        path.id === nodeId ? { ...path, label } : path
      );
      usersDataMap.set(ydoc.clientID.toString(), {
        ...currentUserData,
        currentDiagramPath: updatedPath,
        timestamp: Date.now(),
      });
    }
  }, []);

  const onDiagramDrillDown = useCallback(
    (newDiagramId: string, newDiagramLabel: string) => {
      const currentUserData = usersDataMap.get(ydoc.clientID.toString());
      const nextPath = normalizePath(currentUserData?.currentDiagramPath);
      nextPath.push({ id: newDiagramId, label: newDiagramLabel });

      usersDataMap.set(ydoc.clientID.toString(), {
        id: ydoc.clientID.toString(),
        currentDiagramId: newDiagramId,
        currentDiagramPath: nextPath,
        timestamp: Date.now(),
      });
      fitView?.();
    },
    [normalizePath, fitView]
  );

  const onDiagramDrillUp = useCallback(() => {
    const currentUserData = usersDataMap.get(ydoc.clientID.toString());
    const nextPath = normalizePath(currentUserData?.currentDiagramPath);
    if (nextPath.length > 1) {
      nextPath.pop();
    }
    usersDataMap.set(ydoc.clientID.toString(), {
      id: ydoc.clientID.toString(),
      currentDiagramId: nextPath[nextPath.length - 1]?.id ?? DEFAULT_PATH_ID,
      currentDiagramPath: nextPath,
      timestamp: Date.now(),
    });
    fitView?.();
  }, [normalizePath, fitView]);

  // Drill to a specific index within the currentDiagramPath array (inclusive)
  const onDiagramDrillToIndex = useCallback((index: number) => {
    const currentUserData = usersDataMap.get(ydoc.clientID.toString());
    const current = normalizePath(currentUserData?.currentDiagramPath);
    if (current.length > 0) {
      const clamped = Math.min(Math.max(0, index), current.length - 1);
      const nextPath = current.slice(0, clamped + 1);
      const last = nextPath[nextPath.length - 1];
      usersDataMap.set(ydoc.clientID.toString(), {
        id: ydoc.clientID.toString(),
        currentDiagramId: last?.id ?? DEFAULT_PATH_ID,
        currentDiagramPath: nextPath,
        timestamp: Date.now(),
      });
      fitView?.();
    }
    // If we don't have user data yet, no-op
  }, [normalizePath, fitView]);

  // Drill directly to a node by id, rebuilding full path and ensuring home is first
  const onDiagramDrillToNode = useCallback((targetNodeId: string) => {
    const nodesMap = ydoc.getMap<NodeUnion>('nodes');

    const node = nodesMap.get(targetNodeId);
    const isArktNode = (n: NodeUnion | undefined): n is ArktNode => !!n && n.type === 'arktNode';
    if (!isArktNode(node)) return;

    const ancestorIds = getAncestorIdsFromNode(node); // [parentId, grandParentId, ...]
    const labelsAll = getNodePathLabelsFromId(targetNodeId); // [DEFAULT, rootLabel, ..., parentLabel, nodeLabel]

    // Exclude DEFAULT and the current node label for ancestor labels
    const ancestorLabelsRootToParent = labelsAll.slice(1, -1); // [rootLabel, ..., parentLabel]
    const ancestorIdsRootToParent = [...ancestorIds].reverse(); // [rootAncestorId, ..., parentId]

    const ancestorPairs = ancestorIdsRootToParent.map((id, idx) => ({ id, label: ancestorLabelsRootToParent[idx] }));
    const currentPair = { id: targetNodeId, label: labelsAll[labelsAll.length - 1] };
    const fullPath = [...ancestorPairs, currentPair];
    const normalized = normalizePath(fullPath);

    usersDataMap.set(ydoc.clientID.toString(), {
      id: ydoc.clientID.toString(),
      currentDiagramId: targetNodeId,
      currentDiagramPath: normalized,
      timestamp: Date.now(),
    });
    fitView?.();
  }, [normalizePath, fitView]);

  useEffect(() => {
    const observer = () => {
      setUsersData([...usersDataMap.values()]);
    };

    ensureInitial();
    setUsersData([...usersDataMap.values()]);
    usersDataMap.observe(observer);

    return () => {
      usersDataMap.unobserve(observer);
    };
  }, [ensureInitial]);

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
