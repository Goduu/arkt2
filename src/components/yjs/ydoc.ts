"use client";
import { IndexeddbPersistence } from 'y-indexeddb';
import type { WebrtcProvider } from 'y-webrtc';
import { Doc, encodeStateAsUpdate, applyUpdate } from 'yjs';
import { CursorAwarenessState, SelectionState } from './types';

// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider

const ydoc = new Doc();

// Timing constants for async operations
const PROVIDER_DISCONNECT_DELAY = 50; // Wait time after provider disconnect before destroying persistence
const INDEXEDDB_WRITE_DELAY = 10; // Wait time to ensure IndexedDB writes are flushed

export type AwarenessState = SelectionState & CursorAwarenessState
// Awareness type definition
export interface AwarenessInterface {
    clientID: number;
    getLocalState: () => AwarenessState | null;
    setLocalState: (state: AwarenessState | null) => void;
    setLocalStateField: (field: string, value: unknown) => void;
    getStates: () => Map<number, AwarenessState>;
    on: (event: string, handler: (...args: AwarenessState[]) => void) => void;
    off: (event: string, handler: (...args: AwarenessState[]) => void) => void;
}

// Awareness will be initialized when provider is created
// For local mode, we create a minimal awareness-like object
export let awareness: AwarenessInterface = {
    clientID: 0,
    getLocalState: () => null,
    setLocalState: () => { },
    setLocalStateField: () => { },
    getStates: () => new Map(),
    on: () => { },
    off: () => { },
};


const signalingServerUrls = (process.env.NEXT_PUBLIC_YJS_SIGNALING ?? 'ws://localhost:4444')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
const yjsPassword = process.env.NEXT_PUBLIC_YJS_PASSWORD;

// Function to get room name from URL or use default
function getRoomName(): string {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const collabParam = urlParams.get('collab');
        return collabParam || 'local';
    }
    return 'local';
}

/**
 * Provider Singleton Pattern:
 * - Lazily create provider on the client to avoid SSR importing WebRTC
 * - Use promise caching (providerInitPromise) to prevent concurrent initialization
 * - When switching rooms, disconnect old provider before initializing new one
 * 
 * Architecture Decision - Diagram Navigation Storage:
 * - User diagram navigation (currentDiagramId, currentDiagramPath) is stored in Y.Map
 * - This is persistent state, NOT ephemeral presence data
 * - Rationale: We want each user's last viewed diagram to persist across sessions
 * - Cursors and selections use awareness (ephemeral)
 */
let provider: WebrtcProvider | null = null;
let currentRoomName: string | null = null;
let idbPersistence: IndexeddbPersistence | null = null;
let providerInitPromise: Promise<WebrtcProvider | null> | null = null;

async function setupPersistence(roomName: string) {
    if (idbPersistence) {
        try {
            await idbPersistence.destroy();
        } catch {
            // ignore
        }
        idbPersistence = null;
    }

    idbPersistence = new IndexeddbPersistence(roomName, ydoc);

    // Wait for persistence to sync using proper promise
    await new Promise<void>((resolve) => {
        if (idbPersistence!.synced) {
            resolve();
        } else {
            idbPersistence!.once('synced', () => resolve());
        }
    });
}

export async function getProvider() {
    if (typeof window === 'undefined') return null;
    const roomName = getRoomName();

    // Return existing provider if room hasn't changed
    if (provider && currentRoomName === roomName) {
        return provider;
    }

    // If provider initialization is already in progress, wait for it
    if (providerInitPromise) {
        return providerInitPromise;
    }

    // Start provider initialization and store the promise
    providerInitPromise = (async () => {
        try {
            // If room changed, disconnect from old room
            if (provider && currentRoomName !== roomName) {
                try {
                    await disconnectProvider();
                } catch {
                    // ignore
                }
            }

            const { WebrtcProvider } = await import('y-webrtc');
            await setupPersistence(roomName);

            // Ensure user data is initialized for both local and collab modes
            const userId = ydoc.clientID.toString();
            const usersDataMap = ydoc.getMap('usersData');

            // Initialize user data if needed (persistence already synced in setupPersistence)
            if (!usersDataMap.has(userId)) {
                const { DEFAULT_PATH_ID, DEFAULT_PATH_LABEL } = await import('./constants');
                usersDataMap.set(userId, {
                    id: userId,
                    currentDiagramId: DEFAULT_PATH_ID,
                    currentDiagramPath: [{ id: DEFAULT_PATH_ID, label: DEFAULT_PATH_LABEL }],
                    timestamp: Date.now(),
                });
            }

            // if (roomName === 'local') {
            //     currentRoomName = roomName;
            //     return null;
            // }

            const isLocal = roomName === 'local';

            provider = new WebrtcProvider(
                roomName,
                ydoc,
                {
                    signaling: isLocal ? [] : signalingServerUrls,
                    password: yjsPassword || undefined,
                    maxConns: isLocal ? 0 : 6,
                    filterBcConns: true,
                    peerOpts: {
                        config: {
                            iceServers: [
                                { urls: 'stun:stun.l.google.com:19302' },
                                { urls: 'stun:stun1.l.google.com:19302' },
                            ]
                        },
                    }
                }
            );

            // Guard against race conditions: Check if room hasn't changed during async operations
            if (currentRoomName && currentRoomName !== roomName) {
                // Another room change happened, discard this result
                provider.disconnect();
                provider.destroy();
                return null;
            }

            // Use the provider's awareness instance
            awareness = provider.awareness;

            try {
                provider.on('status', (event: { connected: boolean }) => {
                    console.info('WebRTC status:', event);
                });
                provider.on('peers', (event: unknown) => {
                    console.info('WebRTC peers:', event);
                });
                provider.on('synced', (event: unknown) => {
                    console.info('WebRTC sync:', event);
                });
            } catch {
                console.error('Error initializing WebRTC provider');
            }

            currentRoomName = roomName;
            return provider;
        } catch (error) {
            console.error('Error initializing provider:', error);
            throw error;
        } finally {
            // Clear the promise after initialization completes
            providerInitPromise = null;
        }
    })();

    return providerInitPromise;
}

export async function disconnectProvider() {
    try {
        // Clear any pending provider initialization
        providerInitPromise = null;

        // Clear local awareness state (removes cursor and presence data)
        awareness.setLocalState(null);

        // Remove only legacy cursor data from shared maps if it exists
        // IMPORTANT: Keep usersData to preserve diagram navigation state
        const selfId = ydoc.clientID.toString();
        const cursorsMap = ydoc.getMap('cursors');
        try {
            ydoc.transact(() => {
                if (cursorsMap.has(selfId)) cursorsMap.delete(selfId);
                // DO NOT delete from usersDataMap - preserve diagram navigation state
            });
        } catch {
            // ignore
        }

        // Disconnect provider first
        if (provider) {
            provider.disconnect();
            provider.destroy();
            provider = null;
        }

        // Wait for final sync to complete
        await new Promise((resolve) => setTimeout(resolve, PROVIDER_DISCONNECT_DELAY));

        // Then destroy persistence
        if (idbPersistence) {
            try {
                await idbPersistence.destroy();
            } catch {
                // ignore
            }
            idbPersistence = null;
        }

        // Reset awareness to no-op for local mode to prevent memory leaks
        awareness = {
            clientID: ydoc.clientID,
            getLocalState: () => ({}),
            setLocalState: () => { },
            setLocalStateField: () => { },
            getStates: () => new Map(),
            on: () => { },
            off: () => { },
        };

        currentRoomName = null;
    } catch {
        console.error('Error disconnecting provider')
    }
}

// Copy the current document content into the "local" room's IndexedDB store
export async function copyCurrentDocToLocalRoom() {
    if (typeof window === 'undefined') return;
    try {
        const localDoc = new Doc();
        const update = encodeStateAsUpdate(ydoc);
        const { IndexeddbPersistence } = await import('y-indexeddb');
        const persistence = new IndexeddbPersistence('local', localDoc);

        // Wait for initial load before applying our update
        try {
            await persistence.whenSynced;
        } catch {
            // ignore
        }

        applyUpdate(localDoc, update);

        // Strip transient presence from the local room copy
        const localCursors = localDoc.getMap('cursors');
        const localUsersData = localDoc.getMap('usersData');
        localDoc.transact(() => {
            localCursors.clear();
            localUsersData.clear();
        });

        // Give IndexedDB a tick to persist writes
        await new Promise((resolve) => setTimeout(resolve, INDEXEDDB_WRITE_DELAY));
    } catch (err) {
        console.error('Failed to copy current Yjs doc to local room', err);
    }
}

// Load data from the "local" room into the current ydoc (one-way)
export async function copyLocalRoomToCurrentDoc() {
    if (typeof window === 'undefined') return;
    try {
        // Save current user's diagram position before loading
        const currentUserId = ydoc.clientID.toString();
        const currentUsersDataMap = ydoc.getMap('usersData');
        const currentUserData = currentUsersDataMap.get(currentUserId);

        const localDoc = new Doc();
        const { IndexeddbPersistence } = await import('y-indexeddb');
        const persistence = new IndexeddbPersistence('local', localDoc);
        try {
            await persistence.whenSynced;
        } catch {
            // ignore
        }

        const update = encodeStateAsUpdate(localDoc);
        applyUpdate(ydoc, update);

        // Clear only cursors and OTHER users' data
        const cursors = ydoc.getMap('cursors');
        const usersData = ydoc.getMap('usersData');
        ydoc.transact(() => {
            cursors.clear();
            // Clear all users EXCEPT current user
            for (const [userId] of usersData) {
                if (userId !== currentUserId) {
                    usersData.delete(userId);
                }
            }
            // Restore/preserve current user's diagram position
            if (currentUserData) {
                usersData.set(currentUserId, currentUserData);
            }
        });
    } catch (err) {
        console.error('Failed to copy local room Yjs doc into current doc', err);
    }
}

// Prepare a new collaboration room by seeding it with the current local data
export async function prepareCollabShare(roomName: string) {
    if (typeof window === 'undefined') return;
    if (!roomName || roomName === 'local') return;
    try {
        // Start from local IndexedDB state
        await copyLocalRoomToCurrentDoc();

        // Save current user's diagram position before seeding
        const currentUserId = ydoc.clientID.toString();
        const usersDataMap = ydoc.getMap('usersData');
        const currentUserData = usersDataMap.get(currentUserId);

        // Persist the seeded current ydoc state into the target room's IndexedDB
        const seededUpdate = encodeStateAsUpdate(ydoc);
        const { IndexeddbPersistence } = await import('y-indexeddb');
        const targetDoc = new Doc();
        const targetPersistence = new IndexeddbPersistence(roomName, targetDoc);
        try {
            await targetPersistence.whenSynced;
        } catch {
            // ignore
        }
        applyUpdate(targetDoc, seededUpdate);

        // Clear only cursors and OTHER users' data, preserve current user's diagram position
        const targetCursors = targetDoc.getMap('cursors');
        const targetUsersData = targetDoc.getMap('usersData');
        targetDoc.transact(() => {
            targetCursors.clear();
            // Clear all users EXCEPT current user
            for (const [userId] of targetUsersData) {
                if (userId !== currentUserId) {
                    targetUsersData.delete(userId);
                }
            }
            // Ensure current user's data is set
            if (currentUserData) {
                targetUsersData.set(currentUserId, currentUserData);
            }
        });
        await new Promise((resolve) => setTimeout(resolve, INDEXEDDB_WRITE_DELAY));
    } catch (err) {
        console.error('Failed to prepare collab share for room', roomName, err);
    }
}

// Auto-init on the client
if (typeof window !== 'undefined') {
    void getProvider();

    // Ensure we disconnect from signaling and peers when leaving the page
    const cleanup = () => {
        void disconnectProvider();
    };

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
}

export default ydoc;
