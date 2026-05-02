# Middleware

Middleware is a first-class rwsdk concept — this directory is the project's implementation of that pattern. See the [rwsdk routing docs](https://docs.rwsdk.com/core/routing) for the framework-level definition and [project architecture](../../docs/development/project-architecture.md) for where middleware fits relative to other types in this project.

## What it does

Middleware runs globally on every request before route matching. It prepares the request context and response for everything downstream.

## When to add one

If the logic should run on **every single request** — it's middleware. If it should only run on specific routes, it's an interrupter.

The clearest distinguishing rule: **middleware writes to `ctx` to enrich it for downstream consumers — interrupters only read `ctx` to gate access.** A middleware function may also halt the request as a defensive measure when it cannot safely enrich `ctx` (e.g., a bearer token that fails lookup or is revoked). This is different from an interrupter's purpose: the halting is a side effect of a failed enrichment attempt, not the primary job of the function. If a function only reads `ctx` and decides whether to proceed, it belongs in interrupters instead.

## Guidelines

- **Default exports** — one middleware function per file, exported as default.
- **No factory wrapper unless you need configuration** — export the function directly. Only wrap in a factory if the middleware needs options passed at setup time.
- **Return a `Response` to halt** — when you know exactly what the response should be. Redirects, auth walls, intentional 4xx responses. Execution stops and that response is sent.
- **Throw** — only for unexpected errors you cannot handle. These propagate to the error boundary (currently `RootErrorHandler.tsx`). Never throw a redirect or a known error shape — if you know what the response should be, return it.
- **Return nothing in normal operation** — if middleware ran successfully, don't return anything.
