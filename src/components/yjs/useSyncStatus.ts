'use client';

import { useEffect, useState } from 'react';
import { getProvider } from './ydoc';

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'synced';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('disconnected');
  const [peerCount, setPeerCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const setupProviderListeners = async () => {
      try {
        const provider = await getProvider();
        
        if (!provider || !mounted) {
          setStatus('disconnected');
          return;
        }

        // WebRTC status listener
        const onStatus = (event: { connected: boolean }) => {
          if (!mounted) return;
          setStatus(event.connected ? 'connected' : 'connecting');
        };

        // Peers listener
        const onPeers = (event: { added: string[]; removed: string[]; webrtcPeers: string[] }) => {
          if (!mounted) return;
          setPeerCount(event.webrtcPeers?.length || 0);
        };

        // Sync listener
        const onSync = (event: { synced: boolean }) => {
          if (!mounted) return;
          setStatus(event.synced ? 'synced' : 'syncing');
        };

        provider.on('status', onStatus);
        provider.on('peers', onPeers);
        provider.on('synced', onSync);

        return () => {
          provider.off('status', onStatus);
          provider.off('peers', onPeers);
          provider.off('synced', onSync);
        };
      } catch (error) {
        console.error('Error setting up sync status listeners:', error);
        if (mounted) {
          setStatus('disconnected');
        }
      }
    };

    const cleanup = setupProviderListeners();

    return () => {
      mounted = false;
      cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, []);

  return { status, peerCount };
}

