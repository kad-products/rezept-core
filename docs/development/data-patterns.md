# Data Patterns

Conventions for how data is stored, tracked, and kept consistent across the application.

## Audit fields

Every content table carries four audit fields that track who created and last modified a record and when:

| Field | Type | Set by |
|---|---|---|
| `createdAt` | ISO timestamp string | Drizzle `$defaultFn` on insert — never passed by callers |
| `createdBy` | User ID (FK → users) | Repository, from the `userId` parameter |
| `updatedAt` | ISO timestamp string, nullable | Repository on update — null until first update |
| `updatedBy` | User ID (FK → users), nullable | Repository, from the `userId` parameter on update |

`createdBy` and `updatedBy` are always set server-side from the authenticated user's ID. Actions and API handlers pass `userId` down to the repository — they never set audit fields directly, and clients never supply them.

**`users` table:** `createdBy` is nullable. During self-registration there is no prior actor, so `createdBy` is set to `null`. If an admin creates a user on behalf of someone else, the admin's ID would be recorded. The null is semantically meaningful (self-registered), not a gap.

**Known gap:** `updatedAt` is not currently being set on update — tracked in [#242](https://github.com/kad-products/rezept-core/issues/242).

## Soft deletes

All content tables have `deletedAt` (nullable timestamp) and `deletedBy` (nullable user ID). The intent is to never hard-delete records — instead mark them deleted and filter them out of queries.

**Intended behavior:**
- Delete operations set `deletedAt` to the current timestamp and `deletedBy` to the acting user's ID
- All SELECT queries filter `WHERE deletedAt IS NULL`
- Hard `DELETE` statements are not used

**Current gaps:**
- No soft delete functions exist in any repository — there is currently no way to delete records from the app ([#241](https://github.com/kad-products/rezept-core/issues/241))
- No queries currently filter by `deletedAt` — soft-deleted records would appear in results if any existed ([#240](https://github.com/kad-products/rezept-core/issues/240))

## Optimistic updates

There is no optimistic update pattern in use. All mutations are pessimistic — the UI waits for the server response before updating state. `useTransition` is used in some components (passkey login/registration) for loading indicators (`isPending`) only, not for early state updates.

This is intentional for now given the complexity of reconciling optimistic state with RSC rerendering. If optimistic updates are added in future they will need a clear pattern that works with the server action / RSC model.

## Server/client data sync

After a successful mutation, data is refreshed differently depending on context:

| Context | Current behavior |
|---|---|
| Auth (login/logout) | `navigate()` to a new route — forces a full page load which refetches from the server |
| Form mutations (recipe, season, api key) | Form shows inline success/error message; no navigation or revalidation |

**Known gap:** After a create or update via a form, list views and other page data do not refresh without a manual page reload. There is no SWR, React Query, or RSC revalidation mechanism in place — tracked in [#243](https://github.com/kad-products/rezept-core/issues/243).
