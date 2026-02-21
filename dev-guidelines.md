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

### Current: Native FormData

Currently using browser `FormData` API directly:

```typescript
const formData = new FormData();
formData.set('name', 'Spring');
formData.set('country', 'US');

await saveAction(null, formData);
```

### Future: TanStack Form

Plan to migrate to TanStack Form for better type safety and validation integration. When we do:
- Server action signatures will change (no more `prevState`)
- Form state will be more declarative
- Validation will run client-side before submission

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