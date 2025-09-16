import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

import ydoc from './ydoc';
import { stringToColor } from './utils';

const cursorsMap = ydoc.getMap<Cursor>('cursors');

const MAX_IDLE_TIME = 10000;

export type Cursor = {
  id: string;
  color: string;
  x: number;
  y: number;
  timestamp: number;
};

export function useCursorStateSynced() {
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const { screenToFlowPosition } = useReactFlow();

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
      const currentCursorColor = stringToColor(currentClientId);

      cursorsMap.set(currentClientId, {
        id: currentClientId,
        color: currentCursorColor,
        x: position.x,
        y: position.y,
        timestamp: Date.now(),
      });
    },
    [screenToFlowPosition]
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

  return [cursorsWithoutSelf, onMouseMove] as const;
}

export default useCursorStateSynced;
