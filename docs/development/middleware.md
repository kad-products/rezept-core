# Middleware Patterns

## Factory Functions Are Optional

**Don't use factory pattern unless you need configuration:**
```typescript
// ❌ Unnecessary wrapper
export function setupHeaderMiddleware() {
  return async (requestInfo: RequestInfo) => {
    // ...
  };
}

// ✅ Direct export
export default async function headerMiddleware(requestInfo: RequestInfo) {
  // ...
}
```

**Only use factory pattern when you need options:**
```typescript
// ✅ Factory makes sense here
export function setupRateLimit({ maxRequests = 100, windowMs = 60000 } = {}) {
  return async (requestInfo: RequestInfo) => {
    // Use maxRequests and windowMs
  };
}
```

**Why?** Unnecessary abstraction increases cognitive load and makes testing harder. Default to the simplest pattern that works.