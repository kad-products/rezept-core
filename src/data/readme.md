# Data

Static reference data and runtime constants used across the application.

## What belongs here

- **Runtime constants** — values that need to exist at runtime and be imported by other modules (role arrays, permission matrices)
- **Static lookup data** — fixed datasets that don't change without a code deploy (country codes, month names) and don't really require seeding into the database

## What does NOT belong here

- **Type definitions** — go in `src/types/`, not here. Types derived from data in this directory (e.g. `UserRole`, `PermissionRole`) are the exception: they live alongside their source array so the type and the runtime value stay in sync and we don't get into circular imports
- **Computed or derived data** — anything that can be calculated from other sources belongs in the function that needs it, not here
- **Database-backed reference data** — if the data changes without a deploy, it should be in the database

## The roles/types pattern

`roles.ts` is the one place where type definitions are co-located with data rather than living in `src/types/`. This is intentional: the `UserRole` and `PermissionRole` types are derived directly from the `as const` arrays, so keeping them together ensures the type and the runtime value can never drift apart. Other files that need these types import from `@/data/roles`, not `@/types`.

```ts
export const userRoles = ['ADMIN', 'BASIC'] as const;
export type UserRole = (typeof userRoles)[number]; // 'ADMIN' | 'BASIC'
```