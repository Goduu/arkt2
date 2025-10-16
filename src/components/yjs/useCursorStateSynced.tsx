'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

import { awareness } from './ydoc';
import { stringToColor, getOrCreateLocalUserId, getLocalUserName, setLocalUserName } from './utils';
import { usePageVisibility } from './usePageVisibility';
import { CursorAwarenessState } from './types';

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
  const isVisible = usePageVisibility();

  // Stable local identity (persists across reloads)
  const localUserId = useMemo(() => getOrCreateLocalUserId(), []);
  const [localName, setLocalName] = useState<string>(() => getLocalUserName());

  const rafRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize user info in awareness
  useEffect(() => {
    const currentState = awareness.getLocalState() as CursorAwarenessState | null;
    const color = stringToColor(localUserId);
    
    awareness.setLocalStateField('user', {
      name: localName,
      color: color,
    });
    
    // Preserve cursor if it exists
    if (currentState?.cursor) {
      awareness.setLocalStateField('cursor', currentState.cursor);
    }
  }, [localUserId, localName]);

  const flushCursor = useCallback(() => {
    rafRef.current = null;
    if (!lastPosRef.current) return;
    
    const { x, y } = lastPosRef.current;
    awareness.setLocalStateField('cursor', {
      x,
      y,
      timestamp: Date.now(),
    });
  }, []);

  const onMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isVisible) return; // throttle when tab hidden
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    lastPosRef.current = position;
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(flushCursor);
    }
  }, [screenToFlowPosition, flushCursor, isVisible]);

  useEffect(() => {
    const updateCursors = () => {
      const states = awareness.getStates();
      const cursorList: Cursor[] = [];
      
      states.forEach((state: CursorAwarenessState, clientId: number) => {
        if (state.cursor && state.user) {
          cursorList.push({
            id: clientId.toString(),
            name: state.user.name,
            color: state.user.color,
            x: state.cursor.x,
            y: state.cursor.y,
            timestamp: state.cursor.timestamp,
          });
        }
      });
      
      setCursors(cursorList);
    };

    // Initial update
    updateCursors();
    
    // Listen to awareness changes
    awareness.on('change', updateCursors);

    return () => {
      awareness.off('change', updateCursors);
      // Clear cursor on unmount
      awareness.setLocalStateField('cursor', null);
      // Cancel any pending RAF to prevent memory leak
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const cursorsWithoutSelf = useMemo(
    () => cursors.filter(({ id }) => id !== awareness.clientID.toString()),
    [cursors]
  );

  const updateLocalUserName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    
    setLocalUserName(trimmed);
    setLocalName(trimmed);

    const color = stringToColor(localUserId);
    awareness.setLocalStateField('user', {
      name: trimmed,
      color,
    });
  }, [localUserId]);

  return [cursors, cursorsWithoutSelf, onMouseMove, localName, updateLocalUserName] as const;
}

export default useCursorStateSynced;
