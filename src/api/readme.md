# API Handlers

API handlers are rwsdk route handlers for HTTP endpoints. See [project architecture](../../docs/development/project-architecture.md) for where API handlers fit relative to other types.

## What they do

API handlers receive HTTP requests, orchestrate steps and repositories to fulfil them, and return `Response` objects. They are the entry point for non-form callers — currently the bookmarklet import flow.

## Structure

One file per endpoint. The file path mirrors the URL path: `src/api/recipes/imports/scrapes.ts` handles `/api/recipes/imports/scrapes`.

Each file exports a default object keyed by HTTP method, with authentication and permission checks in the handler array, and a private implementation function:

```ts
export default {
    post: [requireAuthentication, requirePermissions('recipes:scrape'), _postHandler] as const,
};

/** @private — exported for testing only, do not call directly */
export async function _postHandler({ request, ctx }: RequestInfo<DefaultAppContext>) {
    // ...
}
```

All routes are registered in `routes.ts` via `route()`.

## Responsibilities

- **Orchestrate** — call steps for complex pipelines, repositories directly for simple operations
- **Return a consistent response shape** — always use the `successResponse` and `errorResponse` utilities from `./utils`
- **Handle step errors** — catch `RzStepError` via the `apiErrorResponse` utility from `./utils`

## Response shape

All API responses use one of two shapes:

```ts
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

Use the utilities from `./utils` — never call `Response.json()` directly or construct `Response` objects manually:

```ts
import { errorResponse, successResponse } from '@/api/utils';

// success
return successResponse(savedRecord);

// error with explicit status
return errorResponse('API key has been revoked', 403);

// step errors (RzStepError thrown by steps)
} catch (err) {
    return apiErrorResponse(err);
}
```

The `error` field is always a single string. Field-level error arrays belong to `ActionState` (the form/action layer) — they have no place in HTTP API responses where clients need a simple, unambiguous message.

### Binary and streaming responses

The JSON response utilities (`successResponse`, `errorResponse`) are JSON-only. Handlers that stream binary content (e.g. `src/api/images.ts` returning an R2 object body) must construct `Response` directly — this is the one documented exception to the "never construct Response manually" rule. Add a comment on the Response construction pointing back to this readme.

## Guidelines

- **No `'use server'`** — API handlers are HTTP route handlers, not server functions
- **`requireAuthentication` in every handler array** — never check `ctx.user` manually inside the handler
- **`ctx.logger` for logging** — API handlers always run in a request context
- **No type definitions** — types live in `@/types`
- **Do not add an `options` key** — CORS preflight (`OPTIONS`) requests are handled automatically by `corsMiddleware`. Adding an `options` key to a handler object will conflict with this.
