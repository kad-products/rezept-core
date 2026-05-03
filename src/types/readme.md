# Types

All shared TypeScript types live here. See [project architecture](../../docs/development/project-architecture.md) for the project-wide types convention.

## What belongs here

Every type used by more than one file in the project — entity types, form data shapes, action states, utility types. Types are never defined inline in step, action, repository, schema, or form files.

## Structure

One file per entity or concern, barrel-exported from `index.ts`. Consumers always import from `@/types`:

```ts
import type { Recipe, ActionState } from '@/types';
```

Never import from individual files:

```ts
// wrong
import type { Recipe } from '@/types/recipes';
```

## Conventions

- **Named exports** — no default exports
- **`type` keyword on imports** — always `import type`, never `import`
- **No runtime code** — types only; no functions, constants, or classes

## Type naming conventions

Types that represent data moving through the request pipeline follow a consistent suffix. The general flow:

```
*FormInput / *ApiInput           raw, unvalidated — source-specific
        ↓
*ValidatedInput                  post-Zod, source-agnostic
        ↓
*UserWriteInput                  insert/update payload, system fields stripped
        ↓  ←— database —→
*DBRead                          row as returned by a query
```

### Suffixes

**`*FormInput`**
Raw data submitted from a browser form, before validation. Used as both the form's initial-value type and its submit type — the same shape serves both because data is always mapped to `*FormInput` before the form opens.

Prefer inferring from the Zod schema rather than defining statically — the schema is the source of truth and the type stays in sync automatically:

```ts
export type SeasonFormInput = z.input<typeof seasonSchemas.form>;
```

If the form needs fields beyond what the schema validates (UI-only state, post-creation display data), extend with an intersection rather than duplicating the full shape:

```ts
// apiKey is populated after creation and displayed in the form but never submitted to the DB
export type ApiKeyFormInput = z.input<typeof apiKeySchemas.form> & { apiKey?: string };
```

**`*ApiInput`**
Raw data arriving from an external source — an API request body, a third-party scrape response, etc. — before validation. Named for the transport, not the caller, so scrape data that arrives via an API call uses `*ApiInput`.

```ts
export type RecipeApiInput = { title: string; ingredients: string[]; ... };
```

**`*ValidatedInput`**
The result of passing any raw input through a Zod schema. Source-agnostic — form and API inputs for the same entity converge to the same validated type. Typically `z.infer<schema>` (the post-transform output type).

```ts
export type SeasonValidatedInput = z.infer<typeof seasonSchemas.form>;
```

**`*UserWriteInput payload passed to a repository `create` or `update` call. Derived from Drizzle's `$inferInsert` with system-managed fields removed (audit timestamps, soft-delete fields, etc.). Represents data ready to be written to the database.

```ts
export type SeasonUserWriteInput<
  typeof seasons.$inferInsert,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

**`*DBRead`**
A row as returned by a database query. Derived from Drizzle's `$inferSelect`. This is the authoritative entity type used throughout the application — repositories, steps, actions, and components all work with `*DBRead` types.

```ts
export type SeasonDBRead = typeof seasons.$inferSelect;
```

> **Note:** Existing entity types (`Recipe`, `Season`, etc.) will be renamed to the `*DBRead` convention. Until that rename lands, treat bare entity names as `*DBRead` equivalents.

### Types that don't fit this pipeline

Not everything belongs to the DB/form flow. Name these descriptively rather than forcing a suffix:

- **`ActionState<T>`** — server action response envelope
- **`*Props`** — React component props (standard TypeScript/React convention)
- **`*Context`** — middleware-enriched request context
- Session, permission, and other runtime data — domain-descriptive names, no suffix required
