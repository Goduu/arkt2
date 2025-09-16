"use client";
import { IndexeddbPersistence } from 'y-indexeddb';
import type { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';
// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider

const ydoc = new Doc();

// Please replace this with your own signaling server.
// We are only hosting a very small and limited instance.
// Head over to https://github.com/yjs/y-websocket-server for more information
// on how to set up your own signaling server.

const signalingServerUrl = (process.env.NEXT_PUBLIC_YJS_SIGNALING as string | undefined) || 'wss://signaling.yjs.dev'

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

export async function getProvider() {
    if (typeof window === 'undefined') return null;
    if (provider) return provider;
    const roomName = getRoomName();

    const { WebrtcProvider } = await import('y-webrtc');
    new IndexeddbPersistence(roomName, ydoc);

    provider = new WebrtcProvider(
        roomName,
        ydoc,
        {
            signaling: [signalingServerUrl],
            maxConns: 5,
            // filterBcConns: true,
            peerOpts: {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
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
            console.log('WebRTC status:', event);
        });
        provider.on('peers', (event: unknown) => {
            console.log('WebRTC peers:', event);
        });
    } catch {
        console.error('Error initializing WebRTC provider');
    }

    return provider;
}

// Auto-init on the client
if (typeof window !== 'undefined') {
    void getProvider();
}

export default ydoc;
