# Claude Context — rezept-core

## What this project is

A recipe management application built on [RedwoodSDK](https://rwsdk.com) (rwsdk), deployed to Cloudflare Workers. Uses server actions, React Server Components, passkey authentication, and Cloudflare D1 (SQLite) as the database.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Cloudflare Workers |
| Framework | RedwoodSDK (rwsdk v1.0.0-beta) |
| Language | TypeScript 5.8 + React 19 |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Sessions | Cloudflare Durable Objects |
| File storage | Cloudflare R2 |
| Auth | SimpleWebAuthn (passkeys) |
| UI | Radix UI, React Select, TanStack Form |
| Build | Vite 7 + `@cloudflare/vite-plugin` |
| Linter/Formatter | Biome 2 |
| Tests | Vitest 4 |
| Package manager | pnpm 10 |

---

## Key Commands

```bash
pnpm dev               # Start dev server (clears Vite cache first)
pnpm build             # Production build
pnpm test              # Run tests in watch mode
pnpm test:run          # Run tests once with coverage
pnpm type-check        # tsc type check (no emit)
pnpm biome:check       # Lint + format check
pnpm biome:fix         # Auto-fix lint + format

# Database
pnpm db:migrate:new    # Generate new migration from schema changes
pnpm db:migrate:dev    # Apply migrations locally
pnpm db:seed           # Seed local database

# Release (CI)
pnpm release           # Build + migrate + deploy (requires CLOUDFLARE_ENV)
```

---

## Project Structure

```
src/
  actions/        Server actions (server-side mutations)
  api/            API route handlers
  components/     React UI components
  data/           Static/reference data
  forms/          TanStack Form setup and field components
  layouts/        Page-level layout components
  middleware/     Request middleware (auth, logging, etc.)
  models/         Drizzle ORM schema definitions (source of truth for migrations)
  pages/          Route-level page components
  repositories/   Data access layer — all DB queries live here
  schemas/        Zod validation schemas
  session/        Durable Object session management

drizzle/          Generated SQL migrations (committed)
docs/
  decisions/      ADRs (MADR format, 0001-*.md)
  testing.md      Testing guide for QA/PO
  data-models.md  Data model reference
  permissions.md  Role/permission docs
dev-guidelines.md Architecture decisions and coding patterns
```

---

## Architecture Patterns

### Repository pattern
All database access goes through `src/repositories/`. Actions call repositories — never query the DB directly in actions or pages. This enables testing actions with mocked repositories for fast unit tests, and integration testing repositories against real in-memory SQLite.

### Server actions over API routes
Prefer server actions (`src/actions/`) for mutations. Simpler, type-safe, no REST boilerplate. See `dev-guidelines.md`.

### Testing layers
- **Schema tests** (`src/schemas/__tests__/`) — validate Zod schema rules
- **Unit tests** (`*.test.ts`) — test actions/middleware with mocked repositories
- **Integration tests** (`*.integration.test.ts`) — test with real in-memory SQLite

Do **not** add `database` parameters to production functions just to make testing easier — use the proxy pattern instead (see `dev-guidelines.md`).

### Types
All shared types live in `src/types` and are barrel-exported from there. Types are never defined inline in step, action, repository, or schema files — always define in `src/types` and import from `@/types`. Co-locating type definitions makes it easier to spot duplicates.

### Forms
Currently using native `FormData`. Migrating to TanStack Form for type safety and client-side validation (see `docs/decisions/0001-form-management-library.md`).

---

## Code Style (Biome)

- Single quotes
- Tabs, width 2
- 130-character line width
- Semicolons required
- Run `pnpm biome:fix` before committing (enforced by lint-staged on commit)

---

## Architectural Decision Records

ADRs live in `docs/decisions/` using MADR format. File naming: `NNNN-kebab-case-title.md`. Status flow: Proposed → Accepted. Mark superseded ones as `Superseded by ADR-XXXX` — don't delete history.

---

## Docs to Reference

- [RedwoodSDK docs](https://rwsdk.com) — framework patterns, server actions, routing
- `dev-guidelines.md` — in-repo architecture decisions and coding patterns
- `docs/testing.md` — testing guide
- `docs/decisions/` — ADRs
