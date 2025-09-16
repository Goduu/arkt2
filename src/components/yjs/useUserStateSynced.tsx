import { useCallback, useEffect, useMemo, useState } from 'react';

import ydoc from './ydoc';

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

export function useUserDataStateSynced() {
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
      return;
    }
    // If we don't have user data yet, no-op
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
    onChangeNodeLabel
  }
}

export default useUserDataStateSynced;
