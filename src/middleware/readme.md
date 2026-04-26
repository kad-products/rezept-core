# Middleware

Middleware is a first-class rwsdk concept — this directory is the project's implementation of that pattern. See the [rwsdk routing docs](https://docs.rwsdk.com/core/routing) for the framework-level definition and [project architecture](../../docs/development/project-architecture.md) for where middleware fits relative to other types in this project.

## What it does

Middleware runs globally on every request before route matching. It prepares the request context and response for everything downstream.

## When to add one

If the logic should run on **every single request** — it's middleware. If it should only run on specific routes, it's an interrupter.

## Guidelines

- **Default exports** — one middleware function per file, exported as default.
- **No factory wrapper unless you need configuration** — export the function directly. Only wrap in a factory if the middleware needs options passed at setup time.
- **Return a `Response` to halt** — if a condition means the request should go no further, return a `Response`. Execution stops and that response is sent.
- **Throw a `Response` to halt with centralized handling** — the global chain wraps each middleware in `try/catch`, so a thrown Response routes to the except handler rather than bypassing it. Use this when you want consistent error processing. See #121.
- **Return nothing in normal operation** — if middleware ran successfully, don't return anything.
