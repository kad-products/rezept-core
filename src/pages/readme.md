# Pages

Pages are async React Server Components — the entry point for browser navigation. See [project architecture](../../docs/development/project-architecture.md) for where pages fit relative to other types.

## What they do

Pages fetch the data they need directly from repositories and render the UI. They are not orchestration layers — they call repositories, not steps or actions.

## Structure

One file per page, co-located with a `routes.ts` that registers all routes for that section:

```
src/pages/
  recipes/
    listing.tsx
    view.tsx
    edit.tsx
    routes.ts
  seasons/
    listing.tsx
    ...
    routes.ts
  root.tsx
```

Each page file exports a single default async component:

```tsx
export default async function Pages__recipes__listing({ ctx, params }: RequestInfo) {
    const recipes = await getRecipes(ctx.user.id);
    return (
        <AppLayout>
            {/* ... */}
        </AppLayout>
    );
}
```

All routes for a section are registered in that section's `routes.ts` as a default export:

```ts
// src/pages/recipes/routes.ts
import { route } from 'rwsdk/router';
import { requireAuthentication } from '@/interrupters/require-authentication';

export default [
    route('/', [requireAuthentication, Pages__recipes__listing]),
    route('/:recipeId', [requireAuthentication, Pages__recipes__view]),
];
```

`worker.tsx` imports each group and mounts it under its prefix — all routing logic lives in `routes.ts`, `worker.tsx` just wires them up:

```ts
// src/worker.tsx
import recipeRoutes from '@/pages/recipes/routes';
// ...
prefix('/recipes', recipeRoutes),
```

## Naming

Components are named `Pages__<section>__<pagename>` such that the name essentially maps to the directory path and filename of the page file with directories being represented by double underscores (`__`) and hyphens being changed to single underscores.  So `src/pages/not-found.tsx` should be `Pages__not_found` and `src/pages/admin/users/edit.tsx` should be `Pages__admin__users__edit`.

## Accessing context and params

Always destructure from the function parameter — never import the `requestInfo` global in page components. The `requestInfo` global is for server actions and utility functions, not pages.

```tsx
// correct
export default async function Pages__recipes__view({ ctx, params }: RequestInfo) {
    const recipe = await getRecipeById(params.recipeId);
}

// incorrect — requestInfo global is for server actions, not pages
import { requestInfo } from 'rwsdk/worker';
export default async function Pages__recipes__view() {
    const { ctx, params } = requestInfo;
}
```

The parameter type is `RequestInfo` (imported from `rwsdk/worker`), not `DefaultAppContext`.

## Layouts

Every page must wrap its content in a layout component. The current layout is `AppLayout`. An admin layout is planned — use whatever layout is appropriate for the page's context, but never render content without a layout.

## Route protection

Interruptors for protected routes go in `routes.ts`, not in `worker.tsx`. Pages that require authentication use `requireAuthentication` in the route array:

```ts
route('/recipes', [requireAuthentication, Pages__recipes__listing]),
```

Public pages omit the interruptor entirely — there is no explicit "allow all" marker needed.

## Guidelines

- **Default export** — one default export per file, the page component
- **`RequestInfo` parameter type** — not `DefaultAppContext`
- **Function parameters for ctx and params** — never the `requestInfo` global
- **Repositories only** — no direct `db` or Drizzle imports; no calls to steps or actions
- **Layout required** — every page renders inside a layout component
- **Interruptors in `routes.ts`** — not in `worker.tsx`
- **No type definitions** — types live in `@/types`
