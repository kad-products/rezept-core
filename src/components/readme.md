# Components

Components are reusable React pieces used by pages, layouts, and forms. See [project architecture](../../docs/development/project-architecture.md) for where components fit relative to other types.

## What they do

Components render UI. They receive data as props — they do not fetch from repositories or call the database directly. Data flows down from pages.

## Two kinds of components

### Generic UI components (`Rz` prefix)

Use-case-agnostic components that form the project's internal UI library. Named with an `Rz` prefix to signal they belong to no specific feature: `RzTable`, `RzCard`.

These live at the top level of `src/components/`.

### Feature components

Components tied to a specific domain — auth, recipes, api-keys, etc. These live in a domain subdirectory once a domain has enough components to warrant grouping:

```
src/components/
  RzTable.tsx       ← generic
  RzCard.tsx        ← generic
  auth/
    PasskeyLogin.tsx
    PasskeyRegistration.tsx
  recipes/
    RecipesTabs.tsx
```

A domain subdirectory is the right call when a domain has three or more components. Before that threshold, components can sit at the top level.

## Guidelines

- **Default export** — one component per file
- **`Rz` prefix for generic components** — no prefix for feature-specific ones
- **`'use client'` first line for client components** — no blank lines or comments before the directive
- **Props for data** — no repository imports, no direct `db` access
- **Client components call server actions for mutations** — never direct repository calls
- **Types used across files live in `@/types`** — types local to a single file may stay co-located.
