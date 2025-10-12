"use client";
import { IndexeddbPersistence } from 'y-indexeddb';
import type { WebrtcProvider } from 'y-webrtc';
import { Doc, encodeStateAsUpdate, applyUpdate } from 'yjs';
// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider

const ydoc = new Doc();


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

// Lazily create provider on the client to avoid SSR importing WebRTC
let provider: WebrtcProvider | null = null;
let currentRoomName: string | null = null;
let idbPersistence: IndexeddbPersistence | null = null;

function setupPersistence(roomName: string) {
    if (idbPersistence) {
        try {
            idbPersistence.destroy();
        } catch {
            // ignore
        }
        idbPersistence = null;
    }

    idbPersistence = new IndexeddbPersistence(roomName, ydoc);
}

export async function getProvider() {
    if (typeof window === 'undefined') return null;
    const roomName = getRoomName();

    // Reinitialize provider if the room changed
    if (provider && currentRoomName === roomName) {
        return provider;
    }

    if (provider && currentRoomName !== roomName) {
        try {
            await disconnectProvider();
        } catch {
            // ignore
        }
    }

    const { WebrtcProvider } = await import('y-webrtc');
    setupPersistence(roomName);

    if(roomName === 'local') {
        currentRoomName = roomName;
        return null;
    }

    provider = new WebrtcProvider(
        roomName,
        ydoc,
        {
            signaling: signalingServerUrls,
            password: yjsPassword || undefined,
            maxConns: 6,
            filterBcConns: true,
            peerOpts: {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        // { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }
                        // Add a free TURN server for better connectivity
                        // {
                        //     urls: 'turn:openrelay.metered.ca:80',
                        //     username: 'openrelayproject',
                        //     credential: 'openrelayproject'
                        // }
                    ]
                },
            }
        }
    );

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
}

export async function disconnectProvider() {
    try {
        // Remove this client's presence from shared maps immediately
        const selfId = ydoc.clientID.toString();
        const cursorsMap = ydoc.getMap('cursors');
        const usersDataMap = ydoc.getMap('usersData');
        try {
            ydoc.transact(() => {
                if (cursorsMap.has(selfId)) cursorsMap.delete(selfId);
                if (usersDataMap.has(selfId)) usersDataMap.delete(selfId);
            });
        } catch {
            // ignore
        }

        if (provider) {
            provider.disconnect();
            provider.destroy();
            provider = null;
        }
        if (idbPersistence) {
            try {
                await idbPersistence.destroy();
            } catch {
                // ignore
            }
            idbPersistence = null;
        }
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
        await new Promise((resolve) => setTimeout(resolve, 10));
    } catch (err) {
        console.error('Failed to copy current Yjs doc to local room', err);
    }
}

// Load data from the "local" room into the current ydoc (one-way)
export async function copyLocalRoomToCurrentDoc() {
    if (typeof window === 'undefined') return;
    try {
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

        // ensure presence maps are empty at start
        const cursors = ydoc.getMap('cursors');
        const usersData = ydoc.getMap('usersData');
        ydoc.transact(() => {
            cursors.clear();
            usersData.clear();
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

        // Clear presence in target
        const targetCursors = targetDoc.getMap('cursors');
        const targetUsersData = targetDoc.getMap('usersData');
        targetDoc.transact(() => {
            targetCursors.clear();
            targetUsersData.clear();
        });
        await new Promise((resolve) => setTimeout(resolve, 10));
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
