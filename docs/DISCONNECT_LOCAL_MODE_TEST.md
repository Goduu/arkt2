# Test: Disconnect to Local Mode - currentDiagramId Preserved

## Issue
When clicking Disconnect, `currentDiagramId` and `currentDiagramPath` were missing in local mode.

## Root Cause
User data initialization was being skipped for local mode because `getProvider()` returned early before the initialization code ran.

## Fix Applied

### Before (Bug)
```typescript
export async function getProvider() {
  // ... setup ...
  await setupPersistence(roomName);
  
  if(roomName === 'local') {
    return null;  // ❌ Returns BEFORE user data initialization
  }
  
  // User data initialization code here (NEVER runs for local!)
  const userId = ydoc.clientID.toString();
  // ... initialize userData ...
}
```

### After (Fixed)
```typescript
export async function getProvider() {
  // ... setup ...
  await setupPersistence(roomName);
  
  // ✅ Initialize user data BEFORE local mode check
  const userId = ydoc.clientID.toString();
  const usersDataMap = ydoc.getMap('usersData');
  
  // Wait for persistence to sync
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Initialize if needed
  if (!usersDataMap.has(userId)) {
    usersDataMap.set(userId, {
      id: userId,
      currentDiagramId: DEFAULT_PATH_ID,
      currentDiagramPath: [{ id: DEFAULT_PATH_ID, label: DEFAULT_PATH_LABEL }],
      timestamp: Date.now(),
    });
  }
  
  if(roomName === 'local') {
    return null;  // ✅ Now returns AFTER user data is ensured
  }
  
  // Provider setup for collab mode...
}
```

## Complete Flow on Disconnect

### Step 1: Click Disconnect Button
```typescript
// CollabPopover.tsx - onDisconnect()
await copyCurrentDocToLocalRoom();  // Save all state to "local" IndexedDB
disconnectProvider();                // Clear cursors, preserve userData
router.push(pathname);               // Remove ?collab= from URL
```

### Step 2: Disconnect Provider
```typescript
// ydoc.ts - disconnectProvider()
awareness.setLocalState(null);      // Clear cursors ✅
cursorsMap.delete(selfId);          // Clear legacy cursors ✅
// usersDataMap NOT touched         // userData preserved in memory ✅
provider.destroy();
idbPersistence.destroy();
```

### Step 3: Get Provider for Local Mode
```typescript
// ydoc.ts - getProvider('local')
await setupPersistence('local');    // Load from "local" IndexedDB into ydoc

// Check usersData after loading
const usersDataMap = ydoc.getMap('usersData');
const userId = ydoc.clientID.toString();

// User data should exist from previous save
if (!usersDataMap.has(userId)) {
  // Initialize if somehow missing
  usersDataMap.set(userId, defaultData);
}

return null;  // No provider for local mode
```

### Step 4: Hook Re-initializes
```typescript
// useUserStateSynced.tsx - useEffect
ensureInitial();  // Normalizes path if needed
observer();       // Sets usersData state
```

## Test Case

### Setup
```javascript
// In collab mode
console.log('Before disconnect:');
const userData = ydoc.getMap('usersData').get(ydoc.clientID.toString());
console.log(userData);
// {
//   id: "123",
//   currentDiagramId: "node-api-5",
//   currentDiagramPath: [
//     { id: "home", label: "Home" },
//     { id: "node-1", label: "Project" },
//     { id: "node-3", label: "Backend" },
//     { id: "node-api-5", label: "API" }
//   ],
//   timestamp: 1234567890
// }
```

### Action: Click Disconnect

### Expected Result
```javascript
// After disconnect (in local mode)
console.log('After disconnect:');
const userData = ydoc.getMap('usersData').get(ydoc.clientID.toString());
console.log(userData);
// {
//   id: "123",
//   currentDiagramId: "node-api-5",  ✅ SAME!
//   currentDiagramPath: [
//     { id: "home", label: "Home" },
//     { id: "node-1", label: "Project" },
//     { id: "node-3", label: "Backend" },
//     { id: "node-api-5", label: "API" }  ✅ SAME!
//   ],
//   timestamp: 1234567891  // Slightly updated
// }
```

### Visual Verification
- ✅ User stays on "API" diagram level
- ✅ Breadcrumb shows: Home > Project > Backend > API
- ✅ No jump to Home
- ✅ All nodes on current level visible
- ✅ Drill-up/down buttons work

## Testing Steps

1. **Start in collab mode**
   - Join a collaboration session
   - Navigate deep: Home → Project → Backend → API

2. **Check state before disconnect**
   ```javascript
   const userData = ydoc.getMap('usersData').get(ydoc.clientID.toString());
   console.log('currentDiagramId:', userData.currentDiagramId);
   console.log('currentDiagramPath:', userData.currentDiagramPath);
   ```

3. **Click Disconnect**
   - Click "Collab" button in top bar
   - Click "Disconnect" in popover
   - Wait for URL to change

4. **Check state after disconnect**
   ```javascript
   // Wait a moment for async operations
   setTimeout(() => {
     const userData = ydoc.getMap('usersData').get(ydoc.clientID.toString());
     console.log('currentDiagramId:', userData.currentDiagramId);
     console.log('currentDiagramPath:', userData.currentDiagramPath);
   }, 500);
   ```

5. **Verify UI**
   - [ ] Still on "API" level (not Home)
   - [ ] Breadcrumb correct
   - [ ] Can drill up
   - [ ] Can drill down into child nodes
   - [ ] Page refresh maintains position

## Troubleshooting

### If currentDiagramId is null/undefined:

**Check 1: Is data being saved?**
```javascript
// Before disconnect
console.log('Saving:', ydoc.getMap('usersData').get(ydoc.clientID.toString()));
```

**Check 2: Is data loaded from IndexedDB?**
```javascript
// After getProvider('local') completes
console.log('Loaded:', ydoc.getMap('usersData').get(ydoc.clientID.toString()));
```

**Check 3: Is initialization running?**
```javascript
// In getProvider after setupPersistence
console.log('Has user data?', usersDataMap.has(userId));
console.log('User data:', usersDataMap.get(userId));
```

### If data exists but UI doesn't update:

**Check: Is hook observing changes?**
```javascript
// In useUserStateSynced
useEffect(() => {
  const observer = () => {
    console.log('usersData changed:', [...usersDataMap.values()]);
    setUsersData([...usersDataMap.values()]);
  };
  // ...
}, []);
```

## Success Criteria

✅ **PASS** if:
1. `currentDiagramId` is NOT null/undefined after disconnect
2. `currentDiagramPath` array has correct entries
3. User stays on same diagram level visually
4. Breadcrumb displays correct path
5. Navigation functions (drill-up/down) work

❌ **FAIL** if:
1. `currentDiagramId` is null/undefined/empty
2. `currentDiagramPath` is empty or only has Home
3. User jumps to Home after disconnect
4. Breadcrumb shows only "Home"

## Related Files Modified
- ✅ `src/components/yjs/ydoc.ts` - Moved user data initialization before local mode return
- ✅ `src/components/yjs/useUserStateSynced.tsx` - Already has ensureInitial()
- ✅ `src/components/yjs/CollabPopover.tsx` - Calls copyCurrentDocToLocalRoom()

## Summary

The fix ensures user data initialization happens for BOTH local and collaboration modes by moving the initialization code before the early return for local mode. This guarantees that `currentDiagramId` and `currentDiagramPath` are always present, whether in local or collaboration mode.

