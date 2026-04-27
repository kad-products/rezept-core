# Project Architecture

This document describes how the application is structured — what each `src/` directory is for, where each type fits in the request lifecycle, and how types relate to each other.

## Request lifecycle

```
Request
  └── Middleware (global, every request)
        └── Route matching
              └── Interruptors (per-route guards)
                    └── Page / API handler / Action
                          ├── Steps (shared pipeline logic)
                          └── Repositories (data access)
```

## Type map

| Directory | Type | Role |
|---|---|---|
| `src/middleware/` | Middleware | Global request enrichment and guards; runs before route matching |
| `src/interrupters/` | Interruptors | Per-route guards; halt with `return`, never `throw` |
| `src/pages/` | Pages | Route handlers for browser navigation; async RSCs that fetch from repositories |
| `src/api/` | API handlers | Route handlers for HTTP endpoints; return `Response.json()` |
| `src/actions/` | Actions | Server functions for form mutations; return `ActionState<T>` |
| `src/steps/` | Steps | Shared pipeline logic called by actions and API handlers; throw `RzStepError` |
| `src/repositories/` | Repositories | Data access layer; the only place that imports `db` and `@/models` |
| `src/schemas/` | Schemas | Zod input validation; called by actions and API handlers before repository access |
| `src/forms/` | Forms | Client-side form components; call server actions on submit |
| `src/components/` | Components | Reusable React components; receive data as props |
| `src/layouts/` | Layouts | Page-level wrapper components providing consistent navigation chrome |
| `src/types/` | Types | All shared TypeScript types; barrel-exported from `index.ts` |
| `src/models/` | Models | Drizzle table schemas and relations; source of truth for migrations |
| `src/durable-objects/` | Durable Objects | Cloudflare Durable Object classes (currently: session management) |
| `src/data/` | Static data | Reference data used by forms and pages (countries, months, permissions) — no README, no pattern to enforce |

## Key rules

- **Repositories are the only DB gateway** — nothing outside `src/repositories/` imports from `@/db` or `@/models`
- **Types are centralised** — all shared types live in `src/types/`, barrel-exported, imported as `@/types`
- **Pages call repositories directly** — not steps or actions
- **Actions and API handlers call repositories or steps** — not each other
- **Steps are for shared logic only** — if only one caller uses it, it doesn't need to be a step
- **Interruptors never throw** — use `return` to halt; throwing is for middleware only

## Each type in detail

Each `src/` directory has its own `readme.md` with structure, patterns, and guidelines for that type. Read the relevant README before working in a given area.
