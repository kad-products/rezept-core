# Interrupters

Interrupters are a first-class rwsdk concept — this directory is the project's implementation of that pattern. See the [rwsdk routing docs](https://docs.rwsdk.com/core/routing) for the framework-level definition and [project architecture](../../docs/development/project-architecture.md) for where interrupters fit relative to other types in this project.

## What they do

Interrupters sit in a specific route's handler chain and run before the final handler. If an interrupter returns a `Response`, execution halts and that response is sent — the rest of the chain never runs. If it returns nothing, the chain continues.

```ts
route('/recipes', [requireAuthentication, RecipesPage])
```

## When to add one

If the logic should run on **specific routes only** — it's an interrupter. If it should run on every request, it's middleware.

The clearest distinguishing rule: **interrupters only read `ctx` to decide whether to halt — they never write to it.** If the function sets anything on `ctx`, it belongs in middleware instead. See the middleware readme for the counterpart rule and its one principled exception.

## Guidelines

- **Named exports** — not default exports.
- **Never throw** — the per-route handler chain has no `try/catch`, so a thrown value will bubble up unhandled. Always `return`.
- **Return a `Response` to halt, return nothing to continue** — no other return values.
- **One check per function** — combine them in the route definition rather than bundling multiple checks into one function.
- **Return `Response.json()` for API routes, a redirect or rendered error for page routes** — match what the caller expects.
- **Keep them lightweight** — interrupters aren't the primary data processing type. Data access in an interrupter makes performance troubleshooting harder since the work happens in the chain rather than the handler where it's expected.
- **Re-export everything from `index.ts`** so consumers import from `@/interrupters`, not individual files.
