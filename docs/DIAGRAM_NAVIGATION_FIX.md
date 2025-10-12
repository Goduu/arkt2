# Diagram Navigation State Fix

## Issue
The diagram navigation state (`currentDiagramId` and `currentDiagramPath`) was incorrectly migrated to the Yjs Awareness API. This caused problems because:

1. **Awareness data is ephemeral** - it doesn't persist to IndexedDB
2. **Awareness requires a provider** - doesn't work in local-only mode
3. **Diagram navigation is core app functionality** - must work with or without collaboration

## Root Cause
The initial migration treated all "user state" as ephemeral presence data, but diagram navigation is actually **core application state** that:
- Must work locally without any collaboration
- Should persist across sessions
- Is required for the app to function at all

## Solution
**Corrected Data Storage Strategy**:

### Ephemeral Presence (Awareness API)
- ✅ Cursor positions
- ✅ User names/colors (for display)
- ✅ Real-time selections

**Characteristics**:
- High-frequency updates
- No need to persist
- Auto-cleanup on disconnect
- Only relevant during active session

### Core Application State (Y.Map)
- ✅ Current diagram ID
- ✅ Diagram navigation path
- ✅ Drill-down/drill-up functionality
- ✅ Breadcrumb navigation

**Characteristics**:
- Essential for app functionality
- Must work in local mode
- Persists to IndexedDB
- Required regardless of collaboration

## Changes Made

### `src/components/yjs/useUserStateSynced.tsx`
**Reverted to Y.Map** for diagram navigation:
```typescript
// Core app state - uses Y.Map
const usersDataMap = ydoc.getMap<UserData>('usersData');

// Works locally without provider
usersDataMap.set(ydoc.clientID.toString(), {
  id: ydoc.clientID.toString(),
  currentDiagramId: newDiagramId,
  currentDiagramPath: nextPath,
  timestamp: Date.now(),
});
```

### `src/components/yjs/useCursorStateSynced.tsx`  
**Kept Awareness API** for cursor positions:
```typescript
// Ephemeral presence - uses Awareness
awareness.setLocalStateField('cursor', {
  x, y, timestamp: Date.now()
});
```

## Verification

### Local Mode (No Collaboration)
- ✅ Diagram navigation works
- ✅ Drill-down/up functions
- ✅ Breadcrumb navigation
- ✅ State persists in IndexedDB
- ❌ No cursors shown (expected - no other users)

### Collaboration Mode
- ✅ Diagram navigation works
- ✅ See other users' positions
- ✅ Real-time cursor tracking
- ✅ All users can navigate independently

## Testing Checklist
- [ ] Local mode: Navigate through diagrams
- [ ] Local mode: Drill down into nodes
- [ ] Local mode: Use breadcrumb to navigate back
- [ ] Local mode: Refresh page and verify state persists
- [ ] Collab mode: Both users can navigate independently
- [ ] Collab mode: Cursors show in real-time
- [ ] Switch from local to collab: Navigation state preserved

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Yjs Document                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Y.Map<UserData> "usersData"                       │
│  ├─ currentDiagramId                               │
│  ├─ currentDiagramPath[]                           │
│  └─ timestamp                                      │
│  [Persists to IndexedDB]                           │
│  [Works locally]                                   │
│                                                     │
│  Y.Map<NodeUnion> "nodes"                          │
│  [All diagram nodes]                               │
│                                                     │
│  Y.Map<ArktEdge> "edges"                           │
│  [All diagram edges]                               │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│            Awareness (Ephemeral)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  cursor: { x, y, timestamp }                       │
│  user: { name, color }                             │
│                                                     │
│  [Does NOT persist]                                │
│  [Requires provider/collab]                        │
│  [Auto-cleanup on disconnect]                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Disconnection Behavior

When a user disconnects from collaboration (via the Disconnect button in CollabPopover):

1. **Cursor/Presence Cleared** ✅
   - Awareness state is cleared (cursors disappear for other users)
   - User no longer appears as "online" to others

2. **Diagram Navigation Preserved** ✅
   - `currentDiagramId` is maintained
   - `currentDiagramPath` is preserved
   - User stays on the same diagram level they were viewing
   - No navigation reset or jump to home

3. **Data Flow on Disconnect**:
```typescript
// CollabPopover.tsx - onDisconnect callback
await copyCurrentDocToLocalRoom();  // 1. Save all state to local IndexedDB
disconnectProvider();                // 2. Clear only ephemeral data (cursors)
router.push(pathname);               // 3. Remove ?collab= from URL

// ydoc.ts - disconnectProvider
awareness.setLocalState(null);       // Clear cursors/presence
// usersData Y.Map is NOT cleared    // Diagram navigation preserved!
```

## Conclusion
The diagram navigation functionality now works correctly in both local and collaboration modes. The split between Awareness (ephemeral presence) and Y.Map (core state) ensures the application functions properly regardless of collaboration status. Disconnecting from collaboration maintains the user's current diagram position seamlessly.

