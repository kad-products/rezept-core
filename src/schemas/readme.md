# Schemas

Schemas are the input validation layer for this project. See [ADR-0003](../../docs/decisions/0003-schema-validation-approach.md) for why they are standalone Zod validators rather than inferred from Drizzle models, and [project architecture](../../docs/development/project-architecture.md) for where schemas fit relative to other types.

## What they do

Schemas validate incoming data at the boundary — form submissions and API request bodies — before it reaches actions, API handlers, or the data layer. They describe what callers are allowed to send, not what the database looks like.

## When to add one

When an action or API handler receives external input that needs validation. Schemas should not be used to validate database query results or internal data that never crosses a boundary.

## Structure

Each file owns one entity and exports a single namespace object. Properties on the namespace are named by operation or purpose:

```ts
// seasons.ts
export const seasonSchemas = {
    create: z.object({ ... }),
    update: z.object({ ... }),
}

// recipes.ts
export const recipeSchemas = {
    form: z.object({ ... }),       // handles create + update, id is optional
    scrape: z.object({ ... }),     // API/bookmarklet variant
    section: z.object({ ... }),    // sub-schema used compositionally
    sectionIngredient: z.object({ ... }),
}
```

Use `create`/`update` when the shapes genuinely differ. Use a purpose-based name (`form`, `scrape`) when one schema covers multiple operations or serves a specific use case. Sub-schemas that are only referenced internally within the file don't belong on the namespace.

## Utils

`utils.ts` holds reusable Zod primitives where a named function clarifies intent better than the raw Zod equivalent. The canonical examples are things like `optionalString` and `requiredUuid` — the Zod definitions for these are non-obvious enough that naming them adds real value. If a pattern appears across more than one schema file, it belongs in utils. If it's already in utils, use it — don't inline the equivalent pattern.

## Exports

Everything is barrel-exported from `index.ts`. Consumers always import from `@/schemas`, never from individual files.

## Testing

Schemas are tested at 100% coverage. Tests should cover both valid inputs and invalid ones — particularly edge cases like empty strings, null, undefined, boundary values, and unexpected shapes. The goal is confidence that the schema handles anything a caller might send, not just the happy path.
