# Actions

Actions are rwsdk server functions — the entry point for form-based mutations. See [project architecture](../../docs/development/project-architecture.md) for where actions fit relative to other types.

## What they do

Actions accept form data, validate it, check authorization, and orchestrate the repositories (and steps, for complex pipelines) needed to fulfil the request. They are the translation layer between what a form submits and what the data layer does.

## Structure

One file per entity, multiple operations per file. Each operation is a private implementation function. When the operation needs interruptors, it is wrapped in `serverAction()`:

```ts
export const saveWidget = serverAction([requireAuthentication, requirePermissions('widgets:create', 'widgets:update'), _saveWidget]);

/** @private — exported for testing only, do not call directly */
export async function _saveWidget(formData: WidgetFormInput): Promise<ActionState<WidgetDBRead>> {
    // ...
}
```

- The `serverAction()` export is what forms call. Authentication and permission checks go in the wrapper array — not inside the implementation.
- The `_fn` export is the implementation, exposed only for testing.

### When not to use `serverAction()`

If an action has no meaningful interruptors, export the implementation function directly — do not wrap it in `serverAction([_fn])`. A single-item array adds nothing: no interruptors run, and the wrapper is pure indirection. Actions without interruptors are the exception (auth/registration flows are the common case) but the rule is the same regardless of the reason: `serverAction()` is the interruptor mechanism, not a required wrapper for all actions.

## Responsibilities

- **Validate input** via schemas — use `safeParse`, return field errors on failure
- **Orchestrate** — call repositories directly for simple operations; call steps for shared or complex pipelines
- **Return `ActionState<T>`** always — never return raw data or throw to the caller. The type parameter `T` is always the DB read type (e.g. `ActionState<WidgetDBRead>`), not the input type — see [ADR-0009](../../docs/decisions/0009-action-state-return-type.md)

## Error handling

Catch repository errors and return them as `ActionState` failures. Use the `errorResponse` utility from `./utils`:

```ts
} catch (error) {
    return errorResponse(error, 500, 'Failed to save widget');
}
```

### Throwing repository functions (`getXxxById`)

`getXxxById` repository functions always **throw** when a record is not found — they never return `null` or `undefined`. Callers must wrap these calls in their own `try/catch` to return an appropriate error response. A null guard after the call (`if (!record)`) is dead code:

```ts
// correct — inner try/catch for a 400 "not found" distinct from unexpected 500 errors
let widget: Widget;
try {
    widget = await getWidgetById(id, ctx.logger);
} catch (err) {
    return errorResponse(err, 400, 'Widget not found');
}

// wrong — getWidgetById never returns null; this guard is never reached
const widget = await getWidgetById(id, ctx.logger);
if (!widget) { ... } // dead code
```

The `_form` key and array structure for form-level errors is a known rough edge — see #124 for the plan to re-evaluate this once the TanStack Form integration is further along.

## Guidelines

- **`'use server'` at the top of every file** — required by rwsdk
- **Named exports only** — the `serverAction()` wrapper is a `const` export; no default exports
- **No direct DB access** — import from `@/repositories`, never `@/db`
- **No type definitions** — types live in `@/types`
- **No barrel** — import directly from the specific action file (e.g. `@/actions/recipes`); a barrel with `'use server'` re-exports breaks the SSR build, and without it the dev scanner cannot find the actions
