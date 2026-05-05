# Seed data

Generates semi-realistic test data for local development using [drizzle-seed](https://orm.drizzle.team/docs/seed-overview) and [Faker](https://fakerjs.dev/).

## Usage

```bash
pnpm db:seed
```

Resets the local database completely, then populates all tables with generated data. Safe to run repeatedly — each run starts fresh.

## What gets seeded

All tables are populated with relational data: users, recipes with sections, ingredients, instructions, seasons, and associated records. Volume is enough to exercise list views and relationships without being overwhelming.

## Customising

Refinements live in `scripts/seeding/utils/get-standard-refinements.ts`. The commented-out block in `main.ts` shows the override pattern if you need to adjust a specific table's generated values.

This directory is kept outside `src/` intentionally — the seed scripts use direct SQLite access (libsql) rather than the worker DB binding, so they run outside the Cloudflare Worker runtime.
