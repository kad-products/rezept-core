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
