# Database Operations

## Entity Changes / Migrations

1. Make the changes to the `/src/models/*` files.
2. Run `pnpm db:migrate:new` to generate SQL migration files (and related metadata) in `/drizzle`.
3. Run `pnpm db:migrate:dev` to apply migrations to the local database.

## Drizzle Basics

The project uses Drizzle ORM with Cloudflare D1 (SQLite).

Common concepts:

* `sqliteTable()` defines a database table and its columns.
* `relations()` defines relationships between tables.
* `$inferSelect` generates TypeScript types for records returned from queries.
* `$inferInsert` generates TypeScript types for records being inserted.

Typical workflow:

1. Update the schema in `src/models/*`.
2. Generate a migration with `pnpm db:migrate:new`.
3. Review the generated migration files in `drizzle/`.
4. Apply migrations locally with `pnpm db:migrate:dev`.

## Writing Migrations

Most schema changes can be generated automatically by Drizzle.

Examples include:

* Adding a column
* Removing a column
* Creating a table
* Adding indexes

Always review generated SQL before applying it.

For more complex changes, custom SQL may be required. This is especially common when:

* Existing data must be transformed
* Values need to be backfilled
* Multiple schema changes depend on migration order

When performing data migrations, keep schema changes and data updates together so the migration remains reproducible.

## Testing Migrations

After generating a migration:

```bash
pnpm db:migrate:new
```

Apply it locally:

```bash
pnpm db:migrate:dev
```

Verify:

* Migration files were generated correctly in `drizzle/`
* The local database starts successfully
* Application features continue to work as expected

Always inspect generated SQL before committing migration files.

## Migration In CI

Migrations are expected to run as part of the deployment process.

If a migration fails:

* Deployment should be considered failed
* The migration must be corrected before continuing
* Generated SQL and schema assumptions should be reviewed before re-running

Contributors should verify migrations locally before opening a pull request.

## Rollback Strategy

Drizzle and D1 do not provide automatic rollback support.

If a migration must be reversed:

1. Create a new migration that restores the previous schema.
2. Apply the corrective migration.
3. Verify application behavior and data integrity.

Avoid relying on destructive schema changes without a recovery plan.

## Soft Delete Pattern

The project uses soft deletes instead of hard deletes.

Content tables include:

* `deletedAt`
* `deletedBy`

Expected behavior:

* Records are marked as deleted rather than removed.
* Queries should filter out soft-deleted records.
* Hard DELETE operations should generally be avoided.

See `docs/development/data-patterns.md` for additional details.

## Seeding Data

Development environments can be populated using:

```bash
pnpm db:seed
```

Seed data provides a consistent starting point for development and testing.

Contributors may notice seeded users and records appearing in local test results. This is expected behavior and helps ensure predictable development environments.
