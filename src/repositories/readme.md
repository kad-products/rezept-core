# Repositories

Repositories are the project's abstraction over Drizzle ORM — named, typed functions that make database operations readable and maintainable without every caller needing to know the Drizzle query syntax. They are the only place in the application that should import `db` or reference `@/models` directly.

See [ADR-0005](../../docs/decisions/0005-repository-sync-operations.md) for the decision on sync operations and [project architecture](../../docs/development/project-architecture.md) for where repositories fit relative to other types.

## What they do

- Database reads and writes for a given entity
- Sync operations for multi-table entities where a parent record owns a set of children (see ADR-0005)
- Data integrity guards at the DB boundary — narrow checks for constraints the database engine cannot enforce itself (e.g. UUID format validation before a query that would silently misbehave on bad input)

## Error handling

All repository errors use `RzRepositoryError` from `@/classes`, not plain `Error`. This gives callers a typed `type` property to distinguish error categories:

```ts
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';

// Invalid input — thrown before the query runs
throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [id, 'Recipe']);
// → "The value "abc" is not a valid ID for a Recipe"

// Unexpected DB state — thrown after a query returns the wrong count
throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [actual, expected, 'Recipe']);
// → "Expected 1 Recipe record(s), but found 0"
```

**UUID validation** — all ID lookup and update functions that operate on an internal DB UUID (i.e. query on the `id` column) must call `validateUuid` from `./utils` before executing the query. Functions that operate on non-UUID identifiers (e.g. `getCredentialById`, which queries on `credentials.credentialId`, a WebAuthn credential ID) do not apply UUID validation.

**Record count checks** — after any query that expects exactly one result (lookups, updates with `.returning()`), check that the count is 1 and throw `UnexpectedRecordCount` if not. This surfaces unexpected DB state rather than letting `undefined` silently propagate.

## What they don't do

- Schema or form validation — data should be validated before it reaches a repository
- Business logic — decisions about what to do with data belong in actions or API handlers
- Authentication or authorization

## Guidelines

- **Named exports** — one file per entity, functions exported by name.
- **Set audit fields** — repositories are responsible for setting `createdBy` and `updatedBy` from the `userId` passed by the caller. Actions and API handlers do not set these directly.
- **Throw on not-found for ID lookups** — if a caller has an ID and the record doesn't exist, that's an unexpected state worth surfacing as an error. Return `undefined` for search or existence-check operations where absence is a valid result. Callers must wrap `getXxxById` calls in `try/catch` — a null guard after the call is dead code and a sign the caller is using the wrong pattern.
- **Logging** — every repository function accepts `logger: RzLogger` as its last parameter. Use `debug` for fetch/query operations and `info` for creates, updates, and deletes. Pass `ctx.logger` from the caller. Do not use `console.log` or `requestInfo.ctx.logger` directly inside repository functions.
- **No `db` parameters in function signatures** — test concerns should not leak into production code. Use the database proxy pattern for testing.

## Exports

Everything is barrel-exported from `index.ts`. Consumers always import from `@/repositories`, never from individual files.

## Testing

Repository tests run against a real in-memory SQLite database — no mocking. This ensures the query logic is actually correct, not just that function calls were made.
