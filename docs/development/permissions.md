# Permissions — Developer Guide

## Overview

Rezept uses a role-based permission system. Permissions are defined in a central object, assigned to roles, and then enforced in server actions and optionally checked in UI components.

The system has three layers:

- **Definition** — `src/middleware/permissions.ts` contains the permissions object and the `requirePermissions` middleware
- **Enforcement** — server actions use `requirePermissions` as middleware to block unauthorized requests
- **UI hints** — components can read `ctx.permissions` to conditionally show or hide controls

---

## How It Works

At request time, `permissionsMiddleware` runs and populates `ctx.permissions` with a flat array of permission strings for the current user's role. For example, an `ADMIN` user gets:

```
['seasons:create', 'seasons:read', 'seasons:update', 'seasons:delete', 'recipes:create', ...]
```

A user with no role or an unrecognized role gets only permissions marked with `*` (public/read-only).

---

## Adding a New Permission

All permissions are defined in the `permissions` object in `src/middleware/permissions.ts`:

```typescript
const permissions = {
  seasons: {
    create: ['ADMIN'],
    read: ['*'],
    update: ['ADMIN'],
    delete: ['ADMIN'],
  },
  recipes: {
    create: ['ADMIN', 'BASIC'],
    read: ['*'],
    update: ['ADMIN', 'BASIC'],
    delete: ['ADMIN', 'BASIC'],
  },
};
```

To add a new resource or action:

1. Add the new resource or action key to the `permissions` object with the roles that should have access. Use `'*'` to grant access to all users including unauthenticated ones.
2. The `Permission` type is derived automatically via `keyof` inference — no separate type update needed.
3. Run the tests to confirm the middleware still assigns permissions correctly.

**Example — adding a new `notes` resource:**

```typescript
notes: {
  create: ['ADMIN', 'BASIC'],
  read: ['*'],
  update: ['ADMIN', 'BASIC'],
  delete: ['ADMIN'],
},
```

---

## Requiring Permissions in a Server Action

Use `requirePermissions` as the first entry in your `serverAction` middleware array. It accepts one or more permission strings and requires the user to have **all** of them.

```typescript
export const deleteRecipe = serverAction([
  requirePermissions('recipes:delete'),
  _deleteRecipe,
]);

export const adminAction = serverAction([
  requirePermissions('recipes:delete', 'seasons:delete'),
  _adminAction,
]);
```

The underlying handler (prefixed with `_`) is exported separately for testing and should not be called directly in application code:

```typescript
/**
 * @private - exported for testing only, do not use directly
 */
export async function _deleteRecipe(id: string): Promise<ActionState<void>> {
  // ...
}
```

> **Note:** When a permission check fails, the server action returns a 403 response. There is a known issue where this response is not currently catchable at the client call site — this is being tracked as an open issue with rwsdk. In the meantime, use `ctx.permissions` checks in the UI to prevent unauthorized actions from being submitted in the first place (see below).

---

## Checking Permissions in UI Code

`ctx.permissions` is available in React Server Components via `requestInfo.ctx`. Use it to conditionally render controls the user isn't authorized to use.

```typescript
import { requestInfo } from 'rwsdk/worker';

export default function SeasonsPage() {
  const { ctx } = requestInfo;

  return (
    <>
      <SeasonsList />
      {ctx.permissions.includes('seasons:create') && (
        <CreateSeasonButton />
      )}
    </>
  );
}
```

This is a UI hint only — it does not replace server-side enforcement. Always use `requirePermissions` on the action as well.

---

## Testing

When testing server actions that use `requirePermissions`, mock `rwsdk/worker` to expose `getRequestInfo` and set `ctx.permissions` directly:

```typescript
vi.mock('rwsdk/worker', () => ({
  getRequestInfo: () => mockRequestInfo,
  serverAction: (action: any) =>
    Array.isArray(action) ? action[action.length - 1] : action,
}));
```

Test both the passing and failing permission paths. See `src/middleware/__tests__/permissions.test.ts` for examples.