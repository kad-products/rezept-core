# tests/

Support files for the two Vitest configurations. Test files themselves live under `src/`.

## Two test environments

| Config                     | Command             | Runs                              |
| -------------------------- | ------------------- | --------------------------------- |
| `vitest.config.ts`         | `pnpm test`         | All `*.test.ts` files             |
| `vitest.workers.config.ts` | `pnpm test:workers` | All `*.integration.test.ts` files |

Unit and schema tests use a Node.js environment with mocked Cloudflare bindings. Integration tests run inside the actual Cloudflare Workers runtime via `@cloudflare/vitest-pool-workers`, giving them a real D1 binding so runtime incompatibilities surface during tests rather than in production.

## Files

### Standard test support (`vitest.config.ts`)

**`setup.ts`** — Creates a fresh in-memory Drizzle + libsql database for unit/repository tests. These tests don't need D1 fidelity — that's what the Workers pool integration tests are for.

**`mocks/db.ts`** — Proxy-based `@/db` substitute. Forwards every property access to the current `db` instance. Call `resetDb()` in `beforeEach` to swap in a fresh database without touching production code.

**`mocks/cloudflare-workers.ts`** — Stub for the `cloudflare:workers` module, which doesn't exist in Node.js. Provides a configurable `env` object so tests can set environment variables like `REZEPT_ENV`.

**`mocks/rwsdk-auth.ts`** — Stub for `rwsdk/auth`.

### Workers pool test support (`vitest.workers.config.ts`)

**`wrangler.test.jsonc`** — Minimal wrangler config used only during integration tests. Declares just the `rezept_core` D1 binding — no Durable Objects, R2 buckets, or assets. The full `wrangler.jsonc` includes Durable Objects with SQLite storage that cause Miniflare to hold open WebSocket servers, preventing the process from exiting after tests complete.

**`worker.ts`** — Stub worker entrypoint required by `cloudflareTest`. Integration tests import action and repository functions directly rather than via `SELF.fetch()`, so the worker itself does nothing — it exists only to satisfy the configuration requirement.

**`setup.workers.ts`** — Registered as `setupFiles` in `vitest.workers.config.ts`. Runs a `beforeEach` that calls `reset()` to wipe all D1 state and then re-applies migrations, giving every test a clean schema with no leftover data. Per-test isolation is necessary because the workers pool does not automatically isolate D1 storage between tests within the same file.

**`workers-env.d.ts`** — Extends `Cloudflare.Env` to include the `TEST_MIGRATIONS` binding injected by `vitest.workers.config.ts`. Written as a plain ambient declaration file (no top-level imports) so the namespace augmentation is treated as global rather than local to a module.
