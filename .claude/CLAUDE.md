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
  schemas/        Zod input validation schemas
  durable-objects/ Cloudflare Durable Objects (session management)
  steps/          Shared data processing logic for actions and API handlers

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

Each `src/` directory has a `readme.md` defining the pattern for that type. Read those first when working in a given area.

### Type boundaries (brief)
- **Middleware** — global, enriches `ctx`, runs before route matching
- **Interrupters** — per-route guards; `return` Response to halt with a known response, `throw` to surface through `RootErrorHandler`; same throw/return semantics as middleware — only distinction is per-route vs global
- **Actions** — form entry points; `serverAction()` wrapper + `_fn` private impl; return `ActionState<T>`
- **API handlers** — HTTP entry points; default export `{ method: [...chain, _handler] }`; return `Response.json()`
- **Steps** — shared pipeline logic called by actions and API handlers; throw `RzStepError`; accept `logger` as argument
- **Repositories** — only place that imports `db` and `@/models`; handles sync operations for multi-table entities
- **Schemas** — standalone Zod input validators; namespace export per entity (`recipeSchemas.form`)

### Testing layers
- **Schema tests** (`src/schemas/__tests__/`) — 100% coverage required
- **Unit tests** (`*.test.ts`) — actions/middleware with mocked repositories
- **Integration tests** (`*.integration.test.ts`) — real in-memory SQLite

Do **not** add `database` parameters to production functions — use the proxy pattern for testing.

### Types
Types used by more than one file live in `src/types`, barrel-exported from `index.ts`, and imported as `@/types`. Single-use types (used only within one file) may be defined inline in that file. Once a type is referenced from a second file, move it to `src/types`.

### Forms
TanStack Form for state management and validation, Radix Form for accessibility structure. See `src/forms/readme.md` and `docs/decisions/0001-form-management-library.md`.

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

## Agent Worktrees

When working in a git worktree (e.g. created via `git worktree add`), `.dev.vars` is not present because it is gitignored. Without it, `pnpm generate` (`wrangler types`) produces an incomplete `worker-configuration.d.ts` that is missing secrets like `SESSION_SECRET_KEY`, which causes `tsc` to fail.

**Fix:** Copy or symlink `.dev.vars` from the repo root into the worktree before running `pnpm install` or `pnpm generate`:

```bash
cp /path/to/repo/.dev.vars /path/to/worktree/.dev.vars
# or
ln -s /path/to/repo/.dev.vars /path/to/worktree/.dev.vars
```

---

## Docs to Reference

- [RedwoodSDK docs](https://rwsdk.com) — framework patterns, server actions, routing
- `dev-guidelines.md` — in-repo architecture decisions and coding patterns
- `docs/testing.md` — testing guide
- `docs/decisions/` — ADRs
