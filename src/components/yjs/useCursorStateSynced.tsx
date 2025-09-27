import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

import ydoc from './ydoc';
import { stringToColor, getOrCreateLocalUserId, getLocalUserName, setLocalUserName } from './utils';

const cursorsMap = ydoc.getMap<Cursor>('cursors');

const MAX_IDLE_TIME = 10000;

export type Cursor = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  timestamp: number;
};

export function useCursorStateSynced() {
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const { screenToFlowPosition } = useReactFlow();

  // Stable local identity (persists across reloads)
  const localUserId = useMemo(() => getOrCreateLocalUserId(), []);
  const [localName, setLocalName] = useState<string>(() => getLocalUserName());

  // Flush any cursors that have gone stale.
  const flush = useCallback(() => {
    const now = Date.now();

    for (const [id, cursor] of cursorsMap) {
      if (now - cursor.timestamp > MAX_IDLE_TIME) {
        cursorsMap.delete(id);
      }
    }
  }, []);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const currentClientId = ydoc.clientID.toString();
      const currentCursorColor = stringToColor(localUserId);

      cursorsMap.set(currentClientId, {
        id: currentClientId,
        name: localName,
        color: currentCursorColor,
        x: position.x,
        y: position.y,
        timestamp: Date.now(),
      });
    },
    [screenToFlowPosition, localUserId, localName]
  );

  useEffect(() => {
    const timer = window.setInterval(flush, MAX_IDLE_TIME);
    const observer = () => {
      setCursors([...cursorsMap.values()]);
    };

    flush();
    setCursors([...cursorsMap.values()]);
    cursorsMap.observe(observer);

    return () => {
      cursorsMap.unobserve(observer);
      window.clearInterval(timer);
    };
  }, [flush]);

  const cursorsWithoutSelf = useMemo(
    () => cursors.filter(({ id }) => id !== ydoc.clientID.toString()),
    [cursors]
  );

  const updateLocalUserName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    setLocalUserName(trimmed);
    setLocalName(trimmed);

    const currentClientId = ydoc.clientID.toString();
    const existing = cursorsMap.get(currentClientId);
    const color = existing?.color ?? stringToColor(localUserId);
    const x = existing?.x ?? 0;
    const y = existing?.y ?? 0;

    cursorsMap.set(currentClientId, {
      id: currentClientId,
      name: trimmed,
      color,
      x,
      y,
      timestamp: Date.now(),
    });
  }, [localUserId]);

  return [cursors, cursorsWithoutSelf, onMouseMove, localName, updateLocalUserName] as const;
}

export default useCursorStateSynced;
