'use client';

import React from 'react';
import { ClientSelection } from './useSelectionAwareness';

export function getRemoteSelectionStyle(remoteClients: ClientSelection[] | undefined) {
  const clients = remoteClients ?? [];
  if (clients.length === 0) return {} as React.CSSProperties;

  // Build stacked box-shadows to visualize multiple selectors
  // Each ring is 2px larger than the previous one
  const shadows: string[] = [];
  const baseSpread = 2; // px
  for (let i = 0; i < clients.length; i++) {
    const color = clients[i]?.color ?? '#888888';
    const spread = baseSpread * (i + 1);
    shadows.push(`0 0 0 ${spread}px ${color}`);
  }

  const style: React.CSSProperties = {
    // A subtle primary outline from the first client's color
    outline: `2px dashed ${clients[0]?.color ?? '#888888'}`,
    outlineOffset: 2,
    boxShadow: shadows.join(', '),
  };
  return style;
}

export function RemoteSelectionBadges({ remoteClients }: { remoteClients: ClientSelection[] }) {
  if (!remoteClients || remoteClients.length === 0) return null;
  return (
    <div className="pointer-events-none absolute -top-3 -right-3 z-30 flex -space-x-1">
      {remoteClients.slice(0, 4).map((c) => (
        <div
          key={c.clientId}
          title={c.name}
          className="h-5 w-5 rounded-full ring-2 ring-white text-[10px] font-semibold flex items-center justify-center shadow-sm"
          style={{ backgroundColor: c.color }}
        >
          {c.name?.slice(0, 1)?.toUpperCase()}
        </div>
      ))}
      {remoteClients.length > 4 && (
        <div className="h-5 w-5 rounded-full bg-black/40 ring-2 ring-white text-[10px] text-white font-semibold flex items-center justify-center shadow-sm">
          +{remoteClients.length - 4}
        </div>
      )}
    </div>
  );
}

export default RemoteSelectionBadges;


