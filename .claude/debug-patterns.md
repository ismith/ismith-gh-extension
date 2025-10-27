# Debug Patterns

## Console Logging Pattern for Content Scripts

**Problem**: Content scripts cannot write to `window` object due to browser security restrictions. Incremental logging creates noise and makes it hard to copy/paste debug data.

**Solution**: Collect all debug data into a single object, then log it once at the end.

### Pattern

```typescript
// 1. Create a debug collector at the function scope
async function processItems() {
  const debugCollector: Record<string, any> = {};

  for (const item of items) {
    const id = getItemId(item);

    // 2. Pass the collector to helper functions
    const result = checkSomething(item, id, debugCollector);
  }

  // 3. Log everything at the end
  console.log('[DEBUG]', debugCollector);
}

// Helper function accepts optional debugCollector
function checkSomething(item: HTMLElement, debugId?: string, debugCollector?: Record<string, any>): boolean {
  // Initialize debug data only if collector is provided
  const debugData: any = debugCollector && debugId ? {
    id: debugId,
    property1: null,
    property2: [],
    result: false
  } : null;

  // Collect data as you go
  if (debugData) {
    debugData.property1 = someValue;
    debugData.property2.push(someItem);
  }

  // ... do the actual work ...
  const result = /* ... */;

  // Store final result
  if (debugData) {
    debugData.result = result;
    debugCollector![debugId!] = debugData;
  }

  return result;
}
```

### Benefits

1. **Single copy/paste**: All debug data in one object
2. **Clean console**: One log statement instead of many
3. **Content script compatible**: Doesn't rely on `window` object
4. **Optional**: Debug collection has zero overhead when not used
5. **Structured**: Easy to inspect specific items by ID

### Example Output

```javascript
[DEBUG] {
  "2257": {
    id: "2257",
    currentUser: "ismith",
    allLinks: [...],
    hovercardLinks: [...],
    isAuthoredByCopilot: true,
    isAssignedToMe: false,
    result: false
  },
  "2258": { ... },
  "2259": { ... }
}
```

### When to Use

- Debugging content scripts that process multiple items
- When you need to compare behavior across many data points
- When debugging timing/race conditions (shows state at each check)
- When you want users to easily share debug data (copy/paste friendly)
