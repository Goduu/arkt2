# Diagram Navigation Persistence Across Collaboration Modes

## Overview
This document explains how diagram navigation state (`currentDiagramId` and `currentDiagramPath`) is preserved across all collaboration mode transitions.

## Core Principle
**Diagram navigation is core application state, NOT ephemeral collaboration data.**

Therefore:
- ✅ Must work in local mode (no collaboration)
- ✅ Must persist across sessions
- ✅ Must be preserved when switching between local/collab modes
- ✅ Stored in Y.Map, not Awareness

## All Transition Scenarios

### Scenario 1: Local → New Collaboration Room
**User Flow**:
1. User works locally, navigates to: Home → Project → Backend → API
2. User clicks "Collab" and creates new room
3. Shares link with others

**What Happens**:
```typescript
// CollabDialog.tsx - onShare()
await prepareCollabShare(hash);  // Seed new room with local data

// ydoc.ts - prepareCollabShare()
1. Load local IndexedDB data → current ydoc
2. Save current user's diagram position
3. Seed target room with all data (nodes, edges, etc.)
4. Clear OTHER users' data (if any)
5. ✅ Preserve current user's diagram position
```

**Result**: ✅ User stays on "API" level, others joining see all nodes

---

### Scenario 2: Local → Existing Collaboration Room  
**User Flow**:
1. User works locally, navigates to: Home → Project → Backend
2. User receives collab link and clicks it
3. Joins existing room with other active users

**What Happens**:
```typescript
// FlowEditor.tsx - collab param change
await getProvider();  // Connect to room

// ydoc.ts - getProvider()
1. Setup IndexedDB persistence for room
2. Load room's existing data
3. Wait for initial sync (100ms)
4. Check: Does user have entry in room's usersData? 
   - NO → Check local storage for their last position
     - Found → Use local position ✅
     - Not found → Default to Home
   - YES → Keep existing entry (from previous session)
```

**Result**: 
- ✅ If user never joined this room: Uses their local position
- ✅ If user rejoining same room: Uses their last position in that room
- ✅ Other users' positions unchanged

---

### Scenario 3: Collaboration → Local (Disconnect)
**User Flow**:
1. User collaborating, navigated to: Home → Project → Backend → API
2. User clicks "Disconnect" button
3. Returns to local mode

**What Happens**:
```typescript
// CollabPopover.tsx - onDisconnect()
await copyCurrentDocToLocalRoom();  // Save to local
disconnectProvider();               // Clear ephemeral data

// ydoc.ts - disconnectProvider()
1. Clear Awareness state (cursors)
2. Delete legacy cursor data
3. ✅ Keep usersData (diagram position)
4. Disconnect WebRTC provider
5. Destroy IndexedDB persistence
```

**Result**: ✅ User stays on "API" level in local mode

---

### Scenario 4: Collaboration A → Collaboration B (Room Switch)
**User Flow**:
1. User in Room A, navigated to: Home → Project → Backend
2. User receives link to Room B
3. Clicks link to join Room B

**What Happens**:
```typescript
// FlowEditor.tsx - collab param change
if (prev && prev !== collab) {
  await disconnectProvider();  // Leave Room A
}
await getProvider();           // Join Room B

// Disconnect from Room A:
- ✅ Diagram position preserved in memory
- Awareness cleared
- Provider disconnected

// Connect to Room B:
- Load Room B's data
- Check if user has entry in Room B
  - NO → Initialize with current position (from memory)
  - YES → Use position from Room B
```

**Result**: ✅ User's diagram position preserved when switching rooms

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│           Local IndexedDB ("local")             │
│  ┌───────────────────────────────────────────┐  │
│  │ usersData Map                             │  │
│  │  ├─ [userId]: {                           │  │
│  │  │   currentDiagramId: "node-api-3"      │  │
│  │  │   currentDiagramPath: [home, proj...] │  │
│  │  │   timestamp: 123456789                │  │
│  │  └─ }                                      │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↕ 
        copyLocalRoomToCurrentDoc()
        copyCurrentDocToLocalRoom()
                    ↕
┌─────────────────────────────────────────────────┐
│         Current Yjs Document (ydoc)             │
│  ┌───────────────────────────────────────────┐  │
│  │ usersData Map (IN MEMORY)                 │  │
│  │  ├─ [currentUserId]: {                    │  │
│  │  │   currentDiagramId: "node-api-3"  ←────┼──── Always preserved
│  │  │   currentDiagramPath: [...]        │  │  │
│  │  └─ }                                      │  │
│  │  ├─ [otherUserId1]: {...}  ←──────────────┼──── Cleared on transitions
│  │  └─ [otherUserId2]: {...}  ←──────────────┼──── Cleared on transitions
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    ↕
          prepareCollabShare()
          setupPersistence()
                    ↕
┌─────────────────────────────────────────────────┐
│      Collab Room IndexedDB ("room-xxx")         │
│  ┌───────────────────────────────────────────┐  │
│  │ usersData Map                             │  │
│  │  ├─ [userId]: {...}  ←────────────────────┼──── Synced with current
│  │  ├─ [peerUserId1]: {...}                  │  │
│  │  └─ [peerUserId2]: {...}                  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Key Functions

### `copyLocalRoomToCurrentDoc()`
**Purpose**: Load local data into current ydoc  
**Preservation Strategy**:
```typescript
// Before loading
const currentUserData = usersDataMap.get(currentUserId); // Save current position

// After loading
usersData.clear();  // Clear all users
// Restore current user
if (currentUserData) {
  usersData.set(currentUserId, currentUserData);  // ✅ Restored
}
```

### `copyCurrentDocToLocalRoom()`
**Purpose**: Save current ydoc to local storage  
**Preservation Strategy**:
```typescript
// Saves everything including current user's position
const update = encodeStateAsUpdate(ydoc);
applyUpdate(localDoc, update);

// Clears presence but keeps diagram state
localCursors.clear();        // Clear ephemeral
localUsersData.clear();      // Clears all users (saved already in nodes/edges)
```

### `prepareCollabShare(roomName)`
**Purpose**: Seed new collab room with local data  
**Preservation Strategy**:
```typescript
// Before seeding
const currentUserData = usersDataMap.get(currentUserId); // Save

// After seeding target room
targetUsersData.transact(() => {
  // Clear OTHER users
  for (const [userId] of targetUsersData) {
    if (userId !== currentUserId) {
      targetUsersData.delete(userId);  // Clear others
    }
  }
  // Restore current user
  if (currentUserData) {
    targetUsersData.set(currentUserId, currentUserData);  // ✅ Restored
  }
});
```

### `getProvider()`
**Purpose**: Connect to collab room  
**Preservation Strategy**:
```typescript
// After provider connected and synced
if (!usersDataMap.has(userId)) {
  // Try to load from local storage
  const localUserData = await loadFromLocal(userId);
  
  if (localUserData) {
    usersDataMap.set(userId, localUserData);  // ✅ Use local position
  } else {
    usersDataMap.set(userId, defaultHomePosition);  // Default to home
  }
}
// If user already has entry in room, keep it (previous session)
```

### `disconnectProvider()`
**Purpose**: Leave collab room  
**Preservation Strategy**:
```typescript
awareness.setLocalState(null);  // Clear cursors ✅

// Clear legacy cursor data
cursorsMap.delete(selfId);

// DO NOT clear usersData
// usersDataMap.delete(selfId);  ❌ NEVER DO THIS

// Result: Diagram position stays in ydoc memory ✅
```

## Testing All Scenarios

### Test 1: Local → New Collab
```javascript
// Start
localStorage: { usersData: { user1: { currentDiagramId: 'node-3' } } }

// Action: Create new collab room
prepareCollabShare('room-abc');

// Verify
room-abc IndexedDB: { usersData: { user1: { currentDiagramId: 'node-3' } } } ✅
```

### Test 2: Local → Existing Collab
```javascript
// Start
localStorage: { usersData: { user1: { currentDiagramId: 'node-3' } } }
room-xyz: { usersData: { user2: { currentDiagramId: 'home' } } }

// Action: Join room-xyz
getProvider(); // room = 'room-xyz'

// Verify
room-xyz: { 
  usersData: { 
    user1: { currentDiagramId: 'node-3' },  // ✅ From local
    user2: { currentDiagramId: 'home' }     // ✅ Preserved
  } 
}
```

### Test 3: Collab → Local
```javascript
// Start (in room-abc)
ydoc.usersData: { user1: { currentDiagramId: 'node-5' } }

// Action: Disconnect
disconnectProvider();

// Verify
ydoc.usersData: { user1: { currentDiagramId: 'node-5' } }  // ✅ Still there
localStorage: { usersData: { user1: { currentDiagramId: 'node-5' } } }  // ✅ Saved
```

### Test 4: Collab A → Collab B
```javascript
// Start (in room-a)
ydoc.usersData: { user1: { currentDiagramId: 'node-7' } }

// Action: Switch to room-b
await disconnectProvider();  // Leave room-a
await getProvider();         // Join room-b

// Verify
ydoc.usersData: { user1: { currentDiagramId: 'node-7' } }  // ✅ Preserved
room-b: { usersData: { user1: { currentDiagramId: 'node-7' } } }  // ✅ Set
```

## Common Pitfalls (Now Fixed)

### ❌ Pitfall 1: Clearing usersData on disconnect
```typescript
// WRONG
disconnectProvider() {
  usersDataMap.delete(selfId);  // ❌ Loses position!
}

// RIGHT  
disconnectProvider() {
  // Don't touch usersDataMap  ✅ Position preserved
}
```

### ❌ Pitfall 2: Not checking local storage when joining
```typescript
// WRONG
getProvider() {
  usersDataMap.set(userId, defaultHome);  // ❌ Always home
}

// RIGHT
getProvider() {
  if (!usersDataMap.has(userId)) {
    const local = await loadLocal(userId);
    usersDataMap.set(userId, local || defaultHome);  // ✅ Try local first
  }
}
```

### ❌ Pitfall 3: Clearing current user in prepareCollabShare
```typescript
// WRONG
prepareCollabShare() {
  targetUsersData.clear();  // ❌ Loses current user!
}

// RIGHT
prepareCollabShare() {
  const current = usersDataMap.get(currentUserId);
  targetUsersData.clear();
  targetUsersData.set(currentUserId, current);  // ✅ Restore
}
```

## Summary

| Transition | Diagram Position | Implementation |
|------------|------------------|----------------|
| Local → New Collab | ✅ Preserved | `prepareCollabShare` keeps current user |
| Local → Existing Collab | ✅ Preserved | `getProvider` loads from local |
| Collab → Local | ✅ Preserved | `disconnectProvider` doesn't clear |
| Collab A → Collab B | ✅ Preserved | Disconnect + Connect preserves memory |

**Result**: Users can freely switch between local and collaboration modes without losing their place in the diagram hierarchy! 🎉

