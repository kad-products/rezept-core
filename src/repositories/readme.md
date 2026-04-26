# Repositories

Repositories are the project's abstraction over Drizzle ORM — named, typed functions that make database operations readable and maintainable without every caller needing to know the Drizzle query syntax. They are the only place in the application that should import `db` or reference `@/models` directly.

See [ADR-0005](../../docs/decisions/0005-repository-sync-operations.md) for the decision on sync operations and [project architecture](../../docs/development/project-architecture.md) for where repositories fit relative to other types.

## What they do

- Database reads and writes for a given entity
- Sync operations for multi-table entities where a parent record owns a set of children (see ADR-0005)
- Data integrity guards at the DB boundary — narrow checks for constraints the database engine cannot enforce itself (e.g. UUID format validation before a query that would silently misbehave on bad input)

## What they don't do

- Schema or form validation — data should be validated before it reaches a repository
- Business logic — decisions about what to do with data belong in actions or API handlers
- Authentication or authorization

## Guidelines

- **Named exports** — one file per entity, functions exported by name.
- **Throw on not-found for ID lookups** — if a caller has an ID and the record doesn't exist, that's an unexpected state worth surfacing as an error. Return `undefined` for search or existence-check operations where absence is a valid result.
- **Logging** — approach is unresolved, see #122. Do not introduce new `console.log` calls; do not add new `requestInfo.ctx.logger` dependencies.
- **No `db` parameters in function signatures** — test concerns should not leak into production code. Use the database proxy pattern for testing.

## Exports

Everything is barrel-exported from `index.ts`. Consumers always import from `@/repositories`, never from individual files.

## Testing

Repository tests run against a real in-memory SQLite database — no mocking. This ensures the query logic is actually correct, not just that function calls were made.
