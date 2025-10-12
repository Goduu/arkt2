'use client';

import ydoc from './ydoc';

export function syncYMapFromState<T extends { id: string }>(
  map: ReturnType<typeof ydoc.getMap<T>>,
  next: T[],
  origin?: string
) {
  const seen = new Set<string>();
  ydoc.transact(() => {
    for (const item of next) {
      seen.add(item.id);
      map.set(item.id, item);
    }
    for (const item of map.values()) {
      if (!seen.has(item.id)) {
        map.delete(item.id);
      }
    }
  }, { origin: origin ?? 'map-sync' });
}


