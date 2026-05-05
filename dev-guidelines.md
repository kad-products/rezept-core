# Development Guidelines

## Overview

This document captures architectural decisions, coding patterns, and the "why" behind how we build this application. These aren't arbitrary rules - they're based on experience with what makes code maintainable and bugs easier to catch.

---

## Testing Patterns

See [Testing Guide](./testing-guide.md) for comprehensive testing patterns. Key points:

- Use real in-memory database for repository and action integration tests
- Unit test actions with mocked repositories for fast feedback on auth/validation
- Unit test middleware with mocked dependencies
- Don't add `database` parameters to functions just for testing

---

## Form Handling

Forms use **TanStack Form** for state and validation and **Radix UI Form** for accessible structure. See `src/forms/readme.md` for the full pattern including field components, validation setup, and the Radix/TanStack bridge.

Key rules:
- Always import `useAppForm` from `./context`, never directly from `@tanstack/react-form`
- Validation runs `onBlur` against the Zod schema — under review for UX reasons (see #126)
- File uploads are not handled through TanStack Form; use `request.formData()` in the API handler directly

---

## Data Patterns

### Audit fields

All content tables have `createdAt`, `createdBy`, `updatedAt`, `updatedBy`. Repositories are responsible for setting these — actions and API handlers never set audit fields directly. `createdAt` is set via `$defaultFn`; `createdBy` and `updatedBy` come from the `userId` parameter passed to the repository function.

### Soft deletes

All content tables have `deletedAt` and `deletedBy`. Hard deletes are not used. Delete operations set these fields; all SELECT queries must filter `WHERE deletedAt IS NULL`. See `docs/development/data-patterns.md` for full detail and known gaps.

### Data sync after mutations

After auth operations use `navigate()` to force a full page reload. After form mutations the form shows an inline success/error message — there is no automatic revalidation of list views or other page data. See `docs/development/data-patterns.md`.

---

## Architecture Decisions

### Why Server Actions Over API Routes?

- Simpler architecture (no REST boilerplate)
- Type-safe by default (shared types between client/server)
- Automatic serialization
- Built-in with Next.js/React

### Why SQLite + Drizzle?

- **SQLite**: Simple, fast, embeddable. Perfect for this scale.
- **Drizzle**: Type-safe ORM with minimal magic. SQL-like syntax. Great DX.
- **In-memory for tests**: Same database engine, zero setup, fast tests.

### Why Vitest Over Jest?

- Faster (uses Vite's transformer)
- Better ES modules support
- Simpler configuration
- Growing ecosystem

## Documentation

### When to Document

- **Architecture decisions** → This file or ADRs
- **Testing patterns** → Testing Guide
- **API contracts** → JSDoc on public functions
- **Complex logic** → Inline comments explaining "why", not "what"

### When NOT to Document

- Obvious code (e.g., `// Set name to Spring` before `name = 'Spring'`)
- Implementation details that change frequently
- Things that TypeScript types already express

**Good comment:**
```typescript
// Use proxy pattern to avoid passing database through production code.
// See testing-guide.md for full explanation.
export default new Proxy(...)
```

**Bad comment:**
```typescript
// This function gets a season by ID
export async function getSeasonById(id: string) { ... }
```