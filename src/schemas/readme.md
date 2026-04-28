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

## Nullable vs optional fields

Zod `.optional()` produces `T | undefined`. Drizzle infers nullable DB columns as `T | null`. These are different types and will cause TypeScript errors when schema output is assigned to a Drizzle-inferred type.

**Rule: for fields that map to nullable DB columns, use `.optional()` on the validator and `.transform(val => val?.trim() || null)` at the end.** This keeps the key optional in the input shape while producing `string | null` as the output — exactly what Drizzle expects.

```ts
// Wrong — output is string | undefined, not assignable to string | null
title: z.string().max(200).optional(),

// Also wrong — .nullable() makes the key required in the input shape, breaking tests that omit it
title: optionalString.transform(val => val?.trim() ?? null).pipe(z.string().max(200).nullable()),

// Correct — key can be omitted (optional), output is always string | null
title: z.string().max(200).optional().transform(val => val?.trim() || null),
```

Using `||` rather than `??` in the transform means empty strings also become `null`, which is usually correct for form text fields.

Required fields (those with `.notNull()` in the model) don't need this treatment — they should remain required in the schema with no nullable transform.

## Input vs output types

Zod schemas have two distinct TypeScript types: `z.input<typeof schema>` (what callers pass in, before transforms) and `z.output<typeof schema>` / `z.infer<typeof schema>` (what comes out after transforms). These differ whenever a schema uses `.transform()`.

**Rule: use `z.input` when typing action parameters and form data.** Actions receive raw form data, not post-transform values. Using the output type (`z.infer`) causes TypeScript errors in tests and callers because the transformed fields (e.g. `string | null` after a nullable transform) don't match what they actually send.

```ts
// Wrong — z.infer gives the post-transform output type, so optional fields that
// go through .transform(val => val || null) become required `string | null` in
// the type, breaking callers that omit them
export type RecipeFormData = z.infer<typeof recipesSchemas.form>;

// Correct — z.input gives the pre-transform input type; optional fields stay
// optional, matching what actions receive and tests pass
export type RecipeFormData = z.input<typeof recipesSchemas.form>;
```

`parsed.data` inside the action is the output type and is used for DB operations where `string | null` is needed. The parameter type just needs to match what callers send.

## Utils

`utils.ts` holds reusable Zod primitives where a named function clarifies intent better than the raw Zod equivalent. The canonical examples are things like `optionalString` and `requiredUuid` — the Zod definitions for these are non-obvious enough that naming them adds real value. If a pattern appears across more than one schema file, it belongs in utils. If it's already in utils, use it — don't inline the equivalent pattern.

## Exports

Everything is barrel-exported from `index.ts`. Consumers always import from `@/schemas`, never from individual files.

## Testing

Schemas are tested at 100% coverage. Tests should cover both valid inputs and invalid ones — particularly edge cases like empty strings, null, undefined, boundary values, and unexpected shapes. The goal is confidence that the schema handles anything a caller might send, not just the happy path.
