
'use client';

import ydoc from "./ydoc";

export function stringToColor(str: string) {
    let colour = '#';
    let hash = 0;
  
    for (const char of str) {
      hash = char.charCodeAt(0) + (hash << 5) - hash;
    }
  
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      colour += value.toString(16).substring(-2);
    }
  
    return colour.substring(0, 7);
  }

  export const areChangesFromSameDiagram = (changes: NodeChange<ArktNode>[], diagramId: string) => {
    return changes.every((change) => change.item.data.diagramId === diagramId);
  }
  
  export const transactWithUserId = (fn: () => void, userId: string) => {
    ydoc.transact(() => {
      fn();
    }, { userId });
  }

// Stable local identity helpers (do not depend on ydoc.clientID)
const USER_ID_STORAGE_KEY = 'arkt:yjs:userId';
const USER_NAME_STORAGE_KEY = 'arkt:yjs:userName';

export function getOrCreateLocalUserId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const existing = window.localStorage.getItem(USER_ID_STORAGE_KEY);
    if (existing && existing.length > 0) return existing;
    const generated = typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(USER_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return 'anonymous';
  }
}

export function getLocalUserName(): string {
  if (typeof window === 'undefined') return 'Anonymous';
  try {
    const stored = window.localStorage.getItem(USER_NAME_STORAGE_KEY);
    if (stored && stored.length > 0) return stored;
    const id = getOrCreateLocalUserId();
    const fallback = `User-${id.slice(-4)}`;
    window.localStorage.setItem(USER_NAME_STORAGE_KEY, fallback);
    return fallback;
  } catch {
    return 'Anonymous';
  }
}

export function setLocalUserName(name: string) {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      window.localStorage.setItem(USER_NAME_STORAGE_KEY, trimmed);
    }
  } catch {
    // ignore
  }
}