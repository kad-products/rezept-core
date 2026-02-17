# Development Guidelines

## Overview

This document captures architectural decisions, coding patterns, and the "why" behind how we build this application. These aren't arbitrary rules - they're based on experience with what makes code maintainable and bugs easier to catch.

---

## Error Handling Patterns

### `getById()` Functions: Throw on Not Found

**Pattern:**
```typescript
export async function getSeasonById(seasonId: string): Promise<Season> {
  const results = await db.select().from(seasons).where(eq(seasons.id, seasonId));
  
  if (results.length !== 1) {
    throw new Error(`Season not found: ${seasonId}`);
  }
  
  return results[0];
}
```

**Why throw instead of returning `undefined`?**

1. **IDs should exist** - If you have an ID, it came from somewhere. Not finding it usually indicates a bug (deleted record, wrong ID, data inconsistency).

2. **Forces explicit error handling** - The caller must handle the error case with try/catch, making error scenarios visible and deliberate.

3. **Cleaner types** - Return type is `Season` instead of `Season | undefined`, which means less `if (!season)` checks and no accidental undefined access downstream.

4. **Aligns with REST conventions** - A 404 is an error response, not a success with no data.

5. **Makes bugs visible** - Silent undefined returns can hide problems. Thrown errors surface issues immediately.

**When to return undefined instead:**
- Search/filter operations where "not found" is expected (e.g., `findSeasonByName()`)
- Optional lookups where absence is a valid state (e.g., `getCurrentUserSession()`)
- Query-style functions that check existence (e.g., `hasPermission()`)

**Usage in calling code:**
```typescript
try {
  const season = await getSeasonById(id);
  // season is guaranteed to exist here
} catch (error) {
  // Handle not found case explicitly
  return { success: false, message: 'Season not found' };
}
```

---

## Database Patterns

### Repository Layer

All database operations go through repository functions in `src/repositories/`. These functions:
- Handle all Drizzle ORM interactions
- Throw meaningful errors
- Return typed results
- Don't contain business logic (that belongs in actions)

**Example:**
```typescript
// repositories/seasons.ts
export async function createSeason(data: SeasonFormSave, userId: string) {
  const [created] = await db
    .insert(seasons)
    .values({
      ...data,
      createdBy: userId,
    })
    .returning();
    
  return created;
}
```

### No Database Parameters in Production Code

**Don't do this:**
```typescript
export async function getSeason(id: string, database: TestableDB = db) {
  // ...
}
```

**Why?** Test concerns shouldn't leak into production code. Use the database proxy pattern instead (see Testing Guide).

---

## Middleware Patterns

### Factory Functions Are Optional

**Don't use factory pattern unless you need configuration:**
```typescript
// ❌ Unnecessary wrapper
export function setupHeaderMiddleware() {
  return async (requestInfo: RequestInfo) => {
    // ...
  };
}

// ✅ Direct export
export default async function headerMiddleware(requestInfo: RequestInfo) {
  // ...
}
```

**Only use factory pattern when you need options:**
```typescript
// ✅ Factory makes sense here
export function setupRateLimit({ maxRequests = 100, windowMs = 60000 } = {}) {
  return async (requestInfo: RequestInfo) => {
    // Use maxRequests and windowMs
  };
}
```

**Why?** Unnecessary abstraction increases cognitive load and makes testing harder. Default to the simplest pattern that works.

---

## TypeScript Patterns

### Avoid `any` Unless Necessary

Use proper types or `unknown` for truly unknown data. If you must use `any`, add a comment explaining why.

```typescript
// ❌ Lazy typing
const data: any = await fetch();

// ✅ Unknown for truly unknown data
const data: unknown = await fetch();
if (isValidData(data)) {
  // Now safely typed
}

// ✅ Proper typing
const data: ApiResponse = await fetch();
```

### Module Augmentation for Third-Party Types

When extending types from external modules (like `rwsdk`):

```typescript
// src/types/context.ts
import { User } from "@db/index";

interface AppContext {
  user?: User;
  session?: { userId: string | null };
}

// Augment the external module
declare module "rwsdk/worker" {
  interface DefaultAppContext extends AppContext {}
}
```

**Why this pattern?** You can't directly modify external types, but TypeScript's declaration merging lets you extend them. This is the standard pattern for customizing third-party library types.

---

## Testing Patterns

See [Testing Guide](./testing-guide.md) for comprehensive testing patterns. Key points:

- Use real in-memory database for repository and action integration tests
- Unit test actions with mocked repositories for fast feedback on auth/validation
- Unit test middleware with mocked dependencies
- Don't add `database` parameters to functions just for testing

---

## Server Actions

### Action State Pattern

Server actions return a consistent `ActionState` type:

```typescript
type ActionState<T = undefined> = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
};
```

**Why this shape?**
- `success`: Clear boolean for the caller to check
- `message`: User-facing feedback
- `errors`: Validation errors keyed by field name
- `data`: Optional return data (like created record ID)

### Input/Output Type Consistency

The `prevState` parameter and return type of server actions must match for React's `useActionState` hook:

```typescript
async function saveAction(
  prevState: ActionState<{ id: string }> | null | undefined,  // ← Input
  formData: FormData
): Promise<ActionState<{ id: string }>> {                     // ← Output
  // ...
}
```

**Why?** `useActionState` uses a reducer pattern where output becomes the next input.

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

## Schema Validation

### Zod for All External Data

Use Zod schemas to validate:
- Form inputs
- API responses (when we add APIs)
- Database query results (where needed)
- Environment variables

**Pattern:**
```typescript
// schemas/seasons.ts
export const CreateSeasonSchema = z.object({
  name: z.string().min(1),
  country: z.string().length(2),
  // ...
});

// In action
const validation = CreateSeasonSchema.safeParse(rawData);
if (!validation.success) {
  return { success: false, errors: validation.error.flatten().fieldErrors };
}
```

**Why Zod?** Type-safe validation with automatic TypeScript inference. The schema IS the type.

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

---

## Code Style

### Formatting

- Biome for linting and formatting
- Configuration in `biome.json`
- Run `pnpm format` before committing

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx`
- **Functions**: `camelCase()`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE` (only for true constants)

### Import Organization

1. External packages
2. Internal absolute imports (`@/...`)
3. Relative imports
4. Type imports (use `import type` when possible)

```typescript
import { eq } from 'drizzle-orm';

import db from '@/db';
import { seasons } from '@/models';
import type { Season } from '@/types';

import { validateSeason } from './validation';
```

---

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add season creation`
- `fix: correct date validation`
- `refactor: simplify season repository`
- `test: add season integration tests`
- `docs: update testing guide`
- `chore: update dependencies`

**Why?** Enables semantic-release to automatically version and generate changelogs.

### Branch Protection

Main branch requires:
- Passing tests
- Passing commitlint (conventional commits)
- Pull request (even if you're the only dev - good practice)

---

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

---

## Performance Considerations

### Current Scale

- Single developer
- Small dataset (hundreds of records, not millions)
- No need for premature optimization

### When to Optimize

- When tests get slow (currently fast enough)
- When pages load slowly (measure first)
- When users complain (feedback-driven)

### What NOT to Do

- Add caching without profiling
- Over-index on database queries
- Sacrifice code clarity for marginal gains

**Rule:** Make it work, make it right, make it fast (in that order).

---

## Security Considerations

### Authentication

- Passkey-based auth via `rwsdk`
- Session stored in HTTP-only cookies
- Middleware enforces auth on protected routes

### Input Validation

- Always validate with Zod schemas
- Never trust client data
- Sanitize before database operations (Drizzle handles this)

### Database Access

- All queries parameterized (Drizzle prevents SQL injection)
- User ID from session, never from client input
- Audit fields (createdBy, updatedBy) set server-side

---

## Future Considerations

### Things We Might Add

- API routes (if needed for mobile app)
- Rate limiting (if abuse becomes an issue)
- Caching layer (if performance degrades)
- More complex auth (roles, permissions)
- File uploads (images for recipes)

### Things We Won't Add (Yet)

- Microservices (overkill for this scale)
- GraphQL (server actions + TypeScript are simpler)
- Complex state management (React state + server actions work fine)
- Real-time features (no requirement yet)

---

## Questions or Disagreements?

These guidelines reflect current thinking but aren't set in stone. If you have a good reason to deviate or think something should change, start a discussion. The goal is maintainable code, not rigid rules.