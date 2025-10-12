# Fix: Concurrent WebrtcProvider Creation Error

## Error
```
A Yjs Doc connected to room "xB4aKMU8U2wp78XS1Pb8AVmU0I-F_yKhX5-H" already exists!
```

## Root Cause

The `getProvider()` function is **async** and can be called multiple times before it completes. This causes a race condition:

### Before (Race Condition)
```typescript
export async function getProvider() {
  const roomName = getRoomName();
  
  if (provider && currentRoomName === roomName) {
    return provider;  // Check passes
  }
  
  // ... async operations ...
  
  provider = new WebrtcProvider(roomName, ydoc, { ... });
  return provider;
}
```

**What Happens:**
1. **Call 1** (User/Tab 1): Checks `provider` (null) ✓
2. **Call 2** (User/Tab 2): Checks `provider` (still null!) ✓
3. **Call 1**: Starts creating WebrtcProvider
4. **Call 2**: Also starts creating WebrtcProvider for same room
5. 💥 **Error**: "Doc already connected to room"

### The Problem
- Multiple simultaneous calls don't see each other's in-progress initialization
- WebRTC doesn't allow multiple providers for the same room+doc
- This happens when:
  - Second user joins same room
  - Same user opens multiple tabs
  - Fast navigation triggers multiple `useEffect` runs

## Solution

Add a **guard promise** to prevent concurrent provider creation:

```typescript
// Global state
let provider: WebrtcProvider | null = null;
let currentRoomName: string | null = null;
let providerInitPromise: Promise<WebrtcProvider | null> | null = null;  // ✅ NEW

export async function getProvider() {
  const roomName = getRoomName();
  
  // Return existing provider
  if (provider && currentRoomName === roomName) {
    return provider;
  }
  
  // ✅ NEW: If initialization in progress, wait for it
  if (providerInitPromise) {
    return providerInitPromise;
  }
  
  // ✅ NEW: Store the initialization promise
  providerInitPromise = (async () => {
    try {
      // ... async initialization ...
      provider = new WebrtcProvider(roomName, ydoc, { ... });
      return provider;
    } catch (error) {
      console.error('Error initializing provider:', error);
      throw error;
    } finally {
      // ✅ Clear promise when done
      providerInitPromise = null;
    }
  })();
  
  return providerInitPromise;
}
```

## How It Works

### Scenario 1: Sequential Calls ✅
```
Time  Call 1                    Call 2
0ms   Check provider (null)
      Check promise (null)
      Create promise
      Start init...
                               
100ms                            Check provider (still null)
                                 Check promise (exists!) ✅
                                 WAIT for promise
                               
200ms Init completes
      Clear promise
      Return provider
                               
201ms                            Promise resolves
                                 Return same provider ✅
```

### Scenario 2: Concurrent Calls ✅
```
Time  Call 1                    Call 2                    Call 3
0ms   Check provider (null)
      Check promise (null)
      Create promise
      Start init...
                               
1ms                              Check provider (null)
                                 Check promise (exists!) ✅
                                 WAIT for promise
                               
2ms                                                        Check provider (null)
                                                           Check promise (exists!) ✅
                                                           WAIT for promise
                               
200ms Init completes
      Clear promise
      Return provider
                               
201ms                            Promise resolves           Promise resolves
                                 Return same provider ✅    Return same provider ✅
```

## Additional Safety: disconnectProvider()

Also clear the promise when disconnecting to prevent returning stale promises:

```typescript
export async function disconnectProvider() {
  try {
    // ✅ Clear any pending initialization
    providerInitPromise = null;
    
    // ... rest of disconnect logic ...
  }
}
```

## Testing

### Test 1: Multiple Tabs Same Room
1. Open app in Tab 1, join room "abc123"
2. Open app in Tab 2, join same room "abc123"
3. ✅ Both tabs should connect without error
4. ✅ Both tabs should see each other's cursors

### Test 2: Second User Joins
1. User A creates room and shares link
2. User B clicks link to join
3. ✅ User B should connect without error
4. ✅ Both users see each other

### Test 3: Fast Navigation
1. Rapidly switch between collab rooms
2. Click room link, immediately click another room link
3. ✅ Should cleanly disconnect and reconnect
4. ✅ No "already exists" errors

### Test 4: Concurrent Component Mounts
1. Component tree has multiple components calling `getProvider()`
2. All mount simultaneously
3. ✅ Only one provider created
4. ✅ All components get same provider instance

## Verification

```javascript
// In console, try calling getProvider multiple times rapidly
const promises = [];
for (let i = 0; i < 10; i++) {
  promises.push(getProvider());
}

const results = await Promise.all(promises);

// All should be the same provider instance
console.log('All same?', results.every(p => p === results[0]));  // Should be true ✅
```

## Edge Cases Handled

1. ✅ **Multiple simultaneous joins**: Second call waits for first
2. ✅ **Room switching during init**: Disconnect clears promise
3. ✅ **Error during init**: Promise cleared in finally block
4. ✅ **Already initialized**: Returns existing provider immediately

## Performance Impact

- **Before**: Multiple providers attempted, crashes
- **After**: Single provider, other calls wait
- **Overhead**: Minimal (promise check is synchronous)
- **Benefit**: Eliminates race conditions completely

## Files Modified

- ✅ `src/components/yjs/ydoc.ts`
  - Added `providerInitPromise` guard
  - Modified `getProvider()` to use promise guard
  - Modified `disconnectProvider()` to clear promise

## Related Issues Prevented

This fix also prevents:
- Memory leaks from duplicate providers
- Duplicate event listeners
- Inconsistent sync state
- Multiple IndexedDB connections

## Summary

The fix uses a **promise guard pattern** to ensure only one provider initialization can happen at a time. Subsequent calls wait for the in-progress initialization to complete and receive the same provider instance, eliminating the "Doc already connected" error.

