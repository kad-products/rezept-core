# Durable Objects

Cloudflare Durable Objects used by the application. Each file implements a single Durable Object class.

## Contents

- **`sessions.ts`** — `SessionDurableObject`: stores and manages user session state (userId, challenge, expiry). Also defines the `sessions` instance used by middleware and auth actions to read/write sessions. Exported from `worker.tsx` for Cloudflare to bind.

## Guidelines

- **No application logic** — Durable Objects manage state only; business logic belongs in actions or middleware
- **Exported from `worker.tsx`** — Cloudflare requires Durable Object classes to be re-exported from the worker entry point

---

## How the session layer works

`sessions.ts` has two distinct pieces that are easy to conflate:

### 1. `sessions` — the rwsdk helper

```typescript
export const sessions = defineDurableSession({
    secretKey: env.SESSION_SECRET_KEY,
    sessionDurableObject: env.SESSION_DURABLE_OBJECT,
});
```

`defineDurableSession` (from `rwsdk/auth`) returns a `sessions` object with `save`, `load`, and `remove` methods. These are what you call from middleware and actions:

```typescript
await sessions.load(request);           // read session from the DO
await sessions.save(response.headers, { userId: user.id }); // write session
await sessions.remove(request, response.headers);           // revoke session
```

`env.SESSION_DURABLE_OBJECT` is the Cloudflare binding — the bridge between this helper and the actual DO class defined below it.

### 2. `SessionDurableObject` — the actual Durable Object

```typescript
export class SessionDurableObject extends DurableObject { ... }
```

This class defines how session data is physically stored, read, and expired. It implements three methods that rwsdk calls internally:

| Your method | Called by rwsdk when you call |
|---|---|
| `saveSession(data)` | `sessions.save(headers, data)` |
| `getSession()` | `sessions.load(request)` |
| `revokeSession()` | `sessions.remove(request, headers)` |

You never call `saveSession` / `getSession` / `revokeSession` directly — those are the hooks rwsdk calls after handling cookies, encryption, and the DO stub lookup.

### The circular-looking export

`sessions` (the helper) references `env.SESSION_DURABLE_OBJECT`, and `SessionDurableObject` is exported from `worker.tsx` so Cloudflare creates that binding. This means:

- `sessions.ts` defines both pieces
- `index.ts` re-exports both
- `worker.tsx` re-exports `SessionDurableObject` (required by Cloudflare) and imports `sessions` indirectly via middleware

The dependency direction is: worker → middleware → `sessions` helper → DO binding → `SessionDurableObject`. It reads as circular but isn't — the binding is resolved by the Cloudflare runtime, not at import time.

### Extending session data

Session data shape is defined by the `Session` type in `src/types/sessions.ts`. To add a new field:

1. Add it to the `Session` interface
2. Add it as a parameter to `saveSession` (with a default of `null` to match the existing pattern)
3. Include it in the constructed `session` object inside `saveSession`

The second argument to `sessions.save` is typed from `saveSession`'s parameter shape, so updating `saveSession` is all that's needed — callers will automatically see the new field as an accepted option.
