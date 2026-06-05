# Testing Guide for Developers

## Overview

This project uses **Vitest** for all testing. Our testing strategy prioritizes:
1. **Schema validation** - Ensure data shapes are correct
2. **Repository functions** - Verify database operations work
3. **Server actions** - Test business logic and auth
4. **Middleware** - Test request/response handling and session management

We write tests in this order because they build on each other - schemas validate data structure, repositories handle persistence, middleware manages cross-cutting concerns, and actions orchestrate business logic.

## Testing Philosophy

- **Integration-first approach** - Use real in-memory database for most tests
- **Unit tests where appropriate** - Mock only when testing pure logic without I/O
- **Clean production code** - Don't add test-specific parameters to production functions

## Two Test Environments

This project uses two separate Vitest configurations:

| Config | Command | Runs |
|---|---|---|
| `vitest.config.ts` | `pnpm test` | All `*.test.ts` files (unit, schema, middleware, repo) |
| `vitest.workers.config.ts` | `pnpm test:workers` | All `*.integration.test.ts` files |

Integration tests run inside the actual Cloudflare Workers runtime via `@cloudflare/vitest-pool-workers`. This gives them a real Miniflare D1 binding backed by the Drizzle D1 adapter — the same code path as production. Incompatibilities that only surface in the Workers runtime (D1-specific query behaviour, batch semantics, etc.) will fail here rather than silently pass in a Node.js libsql environment.

## Project Structure
```
src/
  schemas/
    __tests__/           # Zod schema validation tests
  repositories/
    __tests__/           # Database operation tests
  actions/
    __tests__/           # Server action tests
      *.test.ts          # Unit tests (mocked repositories)
      *.integration.test.ts  # Integration tests (real D1 binding)
  middleware/
    __tests__/           # Middleware tests (unit with mocks)
  analytics/
    __tests__/           # Analytics helper tests (unit with mocked AE bindings)
  session/
    __tests__/           # Session/auth tests

tests/
  mocks/                 # Shared test mocks
    cloudflare-workers.ts
    rwsdk-auth.ts
    db.ts                # Database proxy for per-test isolation
  setup.ts               # Test database factory (libsql, for pnpm test)
  setup.workers.ts       # Workers pool beforeEach hook (for pnpm test:workers)
  workers-env.d.ts       # Extends Cloudflare.Env with TEST_MIGRATIONS
  wrangler.test.jsonc    # Minimal wrangler config (D1 only) for integration tests
  worker.ts              # Stub worker entrypoint for cloudflareTest
```

See `tests/readme.md` for details on each support file.

## Running Tests
```bash
# Run all unit/schema/repo/middleware tests
pnpm test

# Run integration tests (Workers runtime)
pnpm test:workers

# Run specific file
pnpm test seasons.test.ts

# Run by pattern
pnpm test repositories

# Watch mode
pnpm test -- --watch
```

## Test Database Setup

### Unit and repository tests (`pnpm test`)

These use an in-memory libsql database created fresh for each test:

```typescript
// tests/setup.ts
export async function createTestDb() {
  const client = createClient({ url: ':memory:' });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: './drizzle' });
  return db;
}
```

**Key points:**
- `:memory:` — no files, everything in RAM, fastest possible reset
- Fresh database per test via `resetDb()` in `beforeEach`
- D1 fidelity is not the goal here; that's what the integration tests are for

### Integration tests (`pnpm test:workers`)

These run inside Miniflare (the local Workers runtime) with a real D1 binding:

```typescript
// tests/setup.workers.ts
beforeEach(async () => {
  await reset();                                          // wipe all D1 data
  await applyD1Migrations(env.rezept_core, env.TEST_MIGRATIONS);  // re-apply schema
});
```

**Key points:**
- `reset()` + `applyD1Migrations()` in `beforeEach` gives per-test isolation — the workers pool does not isolate D1 storage between tests automatically
- `env.rezept_core` is a real D1 binding; `src/db.ts` resolves normally against it
- Uses `tests/wrangler.test.jsonc` — a minimal config with only the D1 binding (no Durable Objects, R2, or assets) to avoid Miniflare holding open background connections

## Database Mock Pattern

We use a **Proxy-based approach** to provide per-test database isolation without polluting production code with test parameters:

```typescript
// tests/mocks/db.ts
import { createTestDb } from '../setup';
import type { TestableDB } from '@/types';

let db: TestableDB = {} as TestableDB;

export async function resetDb() {
	db = await createTestDb();
}

export default new Proxy({} as TestableDB, {
	get<K extends keyof TestableDB>(_target: TestableDB, prop: K): TestableDB[K] {
		return db[prop];
	}
}) as TestableDB;
```

The vitest config aliases `@/db` to this mock in all tests:

```typescript
// vitest.config.ts
resolve: {
  alias: {
    '@/db': path.resolve(__dirname, 'tests/mocks/db.ts'),
  }
}
```

**How it works:**
1. Production code imports from `@/db` normally
2. In tests, that import is redirected to our mock
3. The Proxy forwards all operations to the current `db` instance
4. Call `resetDb()` in `beforeEach` to get a fresh database
5. No need to pass `database` parameters through your code

**Benefits:**
- Production code stays clean (no test-specific parameters)
- Complete database isolation between tests
- Works seamlessly at any layer (repositories, actions, middleware)

## Mocking Strategy

### Global Mocks (vitest.config.ts)

These are "infrastructure" that doesn't exist in Node/test environment:
```typescript
resolve: {
  alias: {
    'cloudflare:workers': path.resolve(__dirname, 'tests/mocks/cloudflare-workers.ts'),
    'rwsdk/auth': path.resolve(__dirname, 'tests/mocks/rwsdk-auth.ts'),
    '@/db': path.resolve(__dirname, 'tests/mocks/db.ts'),
    '@': path.resolve(__dirname, './src'),
  }
}
```

### Per-Test Mocks

For things you want to control per-test (auth state, external dependencies):

```typescript
// Mock auth to control who's logged in
const mockRequestInfo = {
  ctx: { user: { id: 'test-user-id' } },
  request: new Request('https://example.com'),
  response: { headers: new Headers() }
};

vi.mock('rwsdk/worker', () => ({
  get requestInfo() { return mockRequestInfo; }
}));

// Change per test
mockRequestInfo.ctx.user = null; // Now unauthenticated
```

### Database Setup in Tests

```typescript
import { resetDb } from '../../../tests/mocks/db';

beforeEach(async () => {
  await resetDb(); // Fresh database for each test
});

// Then just use your repositories/actions normally
const season = await createSeason(data, userId);
```

## Writing Tests

### Schema Tests

Test Zod validation exhaustively:
```typescript
describe('CreateSeason schema', () => {
  it('accepts valid data', () => {
    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid country code', () => {
    const result = schema.safeParse({ ...validData, country: 'INVALID' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(i => i.path[0])).toContain('country');
    }
  });
});
```

**Why:** Catch validation bugs before they hit the database.

### Repository Tests

Use real database operations via the proxy:

```typescript
import { resetDb } from '../../../tests/mocks/db';
import { createUser } from '../users';

beforeEach(async () => {
  await resetDb();
});

it('creates user with username', async () => {
  const user = await createUser('johndoe');
  expect(user.username).toBe('johndoe');
  expect(user.id).toBeDefined();
});

it('retrieves user by id', async () => {
  const created = await createUser('johndoe');
  const retrieved = await getUserById(created.id);
  expect(retrieved.username).toBe('johndoe');
});
```

**Why:** Verify database operations work correctly with real SQL.

### Action Tests

We write both unit and integration tests for actions:

**Unit tests** - Mock repositories, test business logic in isolation:

```typescript
vi.mock('@/repositories/seasons', () => ({
  createSeason: vi.fn(),
  updateSeason: vi.fn(),
}));

import { createSeason, updateSeason } from '@/repositories/seasons';

it('rejects unauthenticated requests', async () => {
  mockRequestInfo.ctx.user = null;
  
  const result = await saveSeason(null, formData);
  expect(result.success).toBe(false);
  expect(createSeason).not.toHaveBeenCalled();
});

it('validates input before calling repository', async () => {
  const invalidFormData = new FormData();
  invalidFormData.set('country', 'INVALID');
  
  const result = await saveSeason(null, invalidFormData);
  expect(result.success).toBe(false);
  expect(createSeason).not.toHaveBeenCalled();
});
```

**Integration tests** - Real database, test full stack:

```typescript
import { resetDb } from '../../../tests/mocks/db';

const mockRequestInfo = {
  ctx: { user: { id: 'test-user-id' } },
  request: new Request('https://example.com'),
};

vi.mock('rwsdk/worker', () => ({
  get requestInfo() { return mockRequestInfo; }
}));

beforeEach(async () => {
  await resetDb();
  mockRequestInfo.ctx.user = { id: 'test-user-id' };
});

it('creates season and persists to database', async () => {
  const formData = new FormData();
  formData.set('name', 'Spring Season');
  formData.set('country', 'US');
  // ... other fields
  
  const result = await saveSeason(null, formData);
  
  expect(result.success).toBe(true);
  expect(result.data?.id).toBeDefined();
  
  // Verify it's in the database
  if (result.data?.id) {
    const season = await getSeasonById(result.data.id);
    expect(season.name).toBe('Spring Season');
  }
});

it('rejects unauthenticated requests', async () => {
  mockRequestInfo.ctx.user = null;
  
  const result = await saveSeason(null, formData);
  expect(result.success).toBe(false);
  
  // Verify nothing was saved
  const allSeasons = await getSeasons();
  expect(allSeasons).toHaveLength(0);
});
```

**Why:** Unit tests give fast feedback on auth and validation logic. Integration tests verify the entire flow works together with the database.

### Middleware Tests

Mock the requestInfo parameter:

```typescript
const mockRequestInfo = {
  ctx: {} as any,
  request: new Request('https://example.com/test'),
  response: { headers: new Headers() },
};

vi.mock('@/session/store', () => ({
  sessions: {
    load: vi.fn(),
    remove: vi.fn(),
  },
}));

import { sessions } from '@/session/store';

beforeEach(() => {
  vi.clearAllMocks();
  mockRequestInfo.ctx = {};
  mockRequestInfo.response.headers = new Headers();
});

it('loads session and sets it on context', async () => {
  const mockSession = { userId: 'test-user-123', /* ... */ };
  vi.mocked(sessions.load).mockResolvedValue(mockSession);

  await authMiddleware(mockRequestInfo as any);

  expect(sessions.load).toHaveBeenCalledWith(mockRequestInfo.request);
  expect(mockRequestInfo.ctx.session).toBe(mockSession);
});
```

**Why:** Middleware is pure logic with mocked I/O - unit tests are appropriate.

## Common Patterns

### Testing Auth
```typescript
mockRequestInfo.ctx.user = null; // Unauthenticated
mockRequestInfo.ctx.user = { id: 'user-123' }; // Authenticated
```

### Testing Validation Errors
```typescript
const result = await action(invalidData);

expect(result.success).toBe(false);
expect(result.errors?.fieldName).toBeDefined();
```

### Testing Database Persistence
```typescript
// After action
const record = await getById(result.data?.id);
expect(record.field).toBe(expectedValue);
```

### Avoiding `!` Non-Null Assertions
```typescript
// Instead of: result.data!.id
if (result.data?.id) {
  // Test assertions here
}
```

### Setting Up Test Users
```typescript
beforeEach(async () => {
  await resetDb();
  const user = await createUser('testuser');
  testUserId = user.id;
  mockRequestInfo.ctx.user = { id: testUserId };
});
```

## What We Test

✅ **Schema validation** - All Zod schemas have comprehensive tests
✅ **Repository CRUD** - Create, read, update operations tested with real DB
✅ **Action business logic (unit)** - Auth, validation, error handling with mocked repos
✅ **Action integration** - Full stack from action → repository → D1 in Workers runtime
✅ **Middleware** - Request/response handling, session management
✅ **Analytics helpers** - CF Analytics Engine helpers with mocked `writeDataPoint` bindings
✅ **Session management** - Create, read, expire, revoke flows
✅ **React components** - Behavioral and visual tests via Playwright CT (`.ct.test.tsx`)

## What We Don't Test (Yet)

🔲 **E2E flows** - Playwright E2E is configured; coverage to grow over time
🔲 **API endpoints** - Not applicable (using server actions)
🔲 **File uploads** - Not implemented yet
🔲 **Complex transactions** - Single operations so far

## Future Directions

### Component Testing

Component tests use `@playwright/experimental-ct-react` and live in `src/components/__tests__/` with a `.ct.test.tsx` extension. Run them with:

```bash
pnpm playwright-ct:run
```

For components with interactive behavior, write behavioral assertions using the `page` fixture alongside `mount`. The `page` fixture is necessary when content renders via a portal (e.g. `RzDialog`) since portal content lives outside the mounted component's DOM subtree:

```tsx
test('opens when trigger is clicked', async ({ mount, page }) => {
  await mount(<RzDialog trigger={<button type="button">Open</button>} title="Confirm">...</RzDialog>);

  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Confirm');
});
```

See [ADR-0008](../decisions/0008-react-component-testing.md) for the decision to use Playwright CT over React Testing Library.

### E2E Testing

Playwright E2E is configured for full browser flows (`.e2e.test.ts`). Run with:

```bash
pnpm playwright-e2e:run
```

### Performance Testing

Consider adding if needed:
- Database query performance benchmarks
- Action execution time monitoring
- Memory leak detection

## Debugging Tests
```bash
# Run single test with logs
pnpm test -- --reporter=verbose seasons.test.ts

# Debug specific test
node --inspect-brk ./node_modules/.bin/vitest run seasons.test.ts
```

**Console logs in tests:**
```typescript
console.log('Result:', JSON.stringify(result, null, 2));
```

## CI/CD Integration

Tests run in GitHub Actions on every PR:
```yaml
- name: Run tests
  run: pnpm test
```

All tests must pass before merging.

## Tips

- **Keep tests focused** - One concept per test
- **Use descriptive names** - "creates season with valid data" not "test1"
- **Arrange-Act-Assert** - Set up, execute, verify
- **Don't test implementation details** - Test behavior, not internals
- **Real database tests are fast** - Don't avoid them for performance reasons
- **Call `resetDb()` in beforeEach** - Ensures test isolation
- **Mock external I/O only** - Database operations should be real

## Key Architectural Decisions

### Why Proxy Pattern?
The Proxy-based database mock lets us:
- Keep production code clean (no `database` parameters everywhere)
- Get true test isolation (fresh DB per test)
- Work seamlessly across all layers
- Avoid the complexity of per-test `vi.mock()` setup

### Why Integration Tests by Default?
- Modern in-memory SQLite is very fast
- Catches real bugs that mocks miss
- Less brittle than heavily mocked tests
- Simpler test code (just call functions normally)
- Repositories always use real DB operations

### Why Unit Tests for Actions?
- Fast feedback on auth and validation logic
- Don't need DB overhead to test permission checks
- Can test edge cases without complex DB setup
- Combined with integration tests for full coverage

### When to Use Unit Tests?
- Pure logic functions with no I/O
- Middleware that needs controlled mock behavior
- Complex validation logic
- When you need precise control over error conditions

## Questions?

Ask in #dev channel or review existing tests for patterns.