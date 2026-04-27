# Models

Models are the Drizzle ORM schema definitions — the source of truth for the database structure and the input to migration generation. See [project architecture](../../docs/development/project-architecture.md) for where models fit relative to other types.

## What they do

- Define table schemas via `sqliteTable`
- Define relations via `relations`
- Generate SQL migrations (via `pnpm db:migrate:new`)

## What they don't do

- Validation — that belongs in `src/schemas`
- Business logic — that belongs in actions or steps
- Direct use by application code — repositories are the only consumers of models

## Structure

One file per table. Everything barrel-exported from `index.ts`. The barrel is only imported by repositories — no other application code should reach into `@/models`.

## Conventions

- **`snake_case` column names** — Drizzle maps to camelCase in TypeScript automatically
- **UUID primary keys** — generated via `crypto.randomUUID()` as a `$defaultFn`
- **Audit fields on all tables** — `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`
- **Soft deletes** — use `deletedAt`/`deletedBy` rather than hard deletes
- **Indexes** — add indexes for foreign keys and any columns used in `where` clauses
- **Relations defined alongside the table** — `recipesRelations` in `recipes.ts`, not in a separate file
