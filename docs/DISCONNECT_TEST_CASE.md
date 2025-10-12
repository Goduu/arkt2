# Disconnect Preserves Diagram Navigation - Test Case

## Objective
Verify that disconnecting from collaboration maintains the user's current position in the diagram hierarchy.

## Test Setup
1. Open application in two browser windows (User A and User B)
2. Start collaboration session (both users join same room)
3. Both users should see each other's cursors

## Test Steps

### Part 1: Navigate Deep into Hierarchy
1. **User A**: Create a node "Project Root"
2. **User A**: Double-click to drill into "Project Root"
3. **User A**: Create a node "Backend Module"
4. **User A**: Double-click to drill into "Backend Module"
5. **User A**: Create a node "API Layer"
6. **User A**: Double-click to drill into "API Layer"
7. **User A**: Verify breadcrumb shows: `Home > Project Root > Backend Module > API Layer`
8. **User B**: Should see User A's cursor moving through the hierarchy

### Part 2: Disconnect from Collaboration
9. **User A**: Click the "Collab" button (top bar)
10. **User A**: Click "Disconnect" button in popover
11. **Verify**: URL changes from `?collab=xxx` to no collab param

### Part 3: Verify State Preservation

**✅ Expected Behavior:**
- User A should still be on "API Layer" diagram level
- Breadcrumb should still show: `Home > Project Root > Backend Module > API Layer`
- User A should NOT jump back to Home
- All nodes on current level should still be visible

**❌ Previous Bug (Now Fixed):**
- User would jump back to Home
- currentDiagramPath would be lost
- Would need to navigate back manually

### Part 4: Verify Navigation Still Works
12. **User A**: Click "Backend Module" in breadcrumb
13. **Verify**: User navigates up one level
14. **User A**: Click "Backend Module" node and drill down
15. **Verify**: User can navigate back into nested diagrams
16. **User A**: Use drill-up button to go back
17. **Verify**: All navigation functions work correctly

### Part 5: Reconnect and Verify
18. **User A**: Click "Collab" button
19. **User A**: Start new collaboration or join existing room
20. **Verify**: User stays on same diagram level (doesn't reset)
21. **Verify**: currentDiagramPath is shared with other users
22. **User B**: Should see User A at their current diagram level

## Technical Verification

### Before Disconnect (Collab Mode)
```javascript
// Check in DevTools Console
const usersDataMap = ydoc.getMap('usersData');
const userData = usersDataMap.get(ydoc.clientID.toString());
console.log('Diagram Path:', userData.currentDiagramPath);
// Should show: [
//   { id: 'home', label: 'Home' },
//   { id: 'node-1', label: 'Project Root' },
//   { id: 'node-2', label: 'Backend Module' },
//   { id: 'node-3', label: 'API Layer' }
// ]
```

### After Disconnect (Local Mode)
```javascript
// Check in DevTools Console
const usersDataMap = ydoc.getMap('usersData');
const userData = usersDataMap.get(ydoc.clientID.toString());
console.log('Diagram Path:', userData.currentDiagramPath);
// Should STILL show the same path!
```

### Check Awareness (Cursors)
```javascript
// Before disconnect
const awareness = require('./ydoc').awareness;
console.log('Local State:', awareness.getLocalState());
// Should show: { cursor: { x, y, timestamp }, user: { name, color } }

// After disconnect
console.log('Local State:', awareness.getLocalState());
// Should show: null (cleared!)
```

## Pass Criteria

✅ **PASS** if:
1. User stays on same diagram level after disconnect
2. Breadcrumb path is preserved
3. No navigation reset to Home
4. Drill-up/down still works after disconnect
5. Reconnecting doesn't reset the path

❌ **FAIL** if:
1. User jumps to Home on disconnect
2. Breadcrumb resets to just "Home"
3. Navigation history is lost
4. Must re-navigate to previous position

## Related Files
- `src/components/yjs/ydoc.ts` - `disconnectProvider()` function
- `src/components/yjs/CollabPopover.tsx` - Disconnect button handler
- `src/components/yjs/useUserStateSynced.tsx` - Diagram navigation state
- `src/components/yjs/useCursorStateSynced.tsx` - Cursor state (should clear)

## Why This Matters

**User Experience**: Users expect to continue working where they left off. Forcing them back to Home after disconnecting would be disruptive and confusing.

**Data Integrity**: Diagram navigation is core application state, not ephemeral collaboration data. It should persist across collaboration sessions.

**Architecture**: This test validates the correct split between:
- **Ephemeral data** (Awareness) → cleared on disconnect
- **Core state** (Y.Map) → preserved on disconnect

