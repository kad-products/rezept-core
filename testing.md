# Testing Guide for Developers

## Overview

This project uses **Vitest** for all testing. Our testing strategy prioritizes:
1. **Schema validation** - Ensure data shapes are correct
2. **Repository functions** - Verify database operations work
3. **Server actions** - Test business logic and auth
4. **Session management** - Critical security and state handling

We write tests in this order because they build on each other - schemas validate data structure, repositories handle persistence, and actions orchestrate business logic.

## Testing Philosophy

- **Unit tests** - Fast, isolated, mocked dependencies. Test logic in isolation.
- **Integration tests** - Real database operations (in-memory), full stack testing. Verify the pieces work together.
- **Both have value** - Unit tests catch logic bugs quickly. Integration tests catch issues in how components interact.

## Project Structure
```
src/
  schemas/
    __tests__/           # Zod schema validation tests
  repositories/
    __tests__/           # Database operation tests (unit - mocked db)
  actions/
    __tests__/           # Server action tests
      *.test.ts          # Unit tests (mocked repos)
      *.integration.test.ts  # Integration tests (real db)
  session/
    __tests__/           # Session/auth tests

tests/
  mocks/                 # Shared test mocks
    cloudflare-workers.ts
    rwsdk-auth.ts
    db.ts
  setup.ts               # Test database creation
```

## Running Tests
```bash
# Run all tests
pnpm test

# Run specific file
pnpm test seasons.test.ts

# Run only unit tests
pnpm test -- --exclude **/*.integration.test.ts

# Run only integration tests
pnpm test seasons.integration

# Watch mode
pnpm test -- --watch
```

## Test Database Setup

Integration tests use an **in-memory SQLite database** created fresh for each test:
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
- `:memory:` means no files, everything in RAM
- Fresh database per test via `beforeEach`
- Real SQL operations, just not against production
- Fast enough for CI/CD

## Mocking Strategy

### Global Mocks (vitest.config.ts)

These are "infrastructure" that doesn't exist in Node/test environment:
```typescript
test: {
  alias: {
    'cloudflare:workers': path.resolve(__dirname, 'tests/mocks/cloudflare-workers.ts'),
    'rwsdk/auth': path.resolve(__dirname, 'tests/mocks/rwsdk-auth.ts'),
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Per-Test Mocks

For things you want to control per-test (auth state, repo behavior):
```typescript
// Mock auth to control who's logged in
const mockRequestInfo = {
  ctx: { user: { id: 'test-user-id' } }
};

vi.mock('rwsdk/worker', () => ({
  get requestInfo() { return mockRequestInfo; }
}));

// Change per test
mockRequestInfo.ctx.user = null; // Now unauthenticated
```

### Database Mock Pattern (for integration tests)

Instead of passing `database` parameter everywhere, use a getter:
```typescript
let testDb: TestableDB;

vi.mock('@/db', () => ({
  get default() { return testDb; }
}));

beforeEach(async () => {
  testDb = await createTestDb(); // Fresh db each test
});
```

The getter makes the mock **dynamic** - it always returns the current `testDb`.

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

### Repository Tests (Unit)

Mock the database, test logic:
```typescript
vi.mock('@/db', () => ({ default: {} as any }));

it('creates user with username', async () => {
  const user = await createUser('johndoe', testDb);
  expect(user.username).toBe('johndoe');
});
```

**Why:** Fast feedback on data manipulation logic.

### Action Tests (Unit)

Mock repositories, test business logic:
```typescript
vi.mock('@/repositories/seasons', () => ({
  createSeason: vi.fn(),
  updateSeason: vi.fn(),
}));

it('rejects unauthenticated requests', async () => {
  mockRequestInfo.ctx.user = null;
  const result = await saveSeason({} as ActionState, formData);
  expect(result?.success).toBe(false);
  expect(createSeason).not.toHaveBeenCalled();
});
```

**Why:** Verify auth, validation, error handling without database overhead.

### Action Tests (Integration)

Real database, test full stack:
```typescript
// seasons.integration.test.ts
let testDb: TestableDB;

vi.mock('@/db', () => ({
  get default() { return testDb; }
}));

it('creates season and persists to database', async () => {
  const result = await saveSeason({} as ActionState, formData);
  
  expect(result?.success).toBe(true);
  expect(result?.data?.id).toBeDefined();
  
  if (result.data?.id) {
    const season = await getSeasonById(result.data.id, testDb);
    expect(season?.name).toBe('Spring Season');
  }
});
```

**Why:** Catch issues in how action → repository → database flow works together.

## Common Patterns

### Testing Auth
```typescript
mockRequestInfo.ctx.user = null; // Unauthenticated
mockRequestInfo.ctx.user = { id: 'user-123' }; // Authenticated
```

### Testing Validation Errors
```typescript
const result = await action(invalidData);

expect(result?.success).toBe(false);
expect(result?.errors?.fieldName).toBeDefined();
```

### Testing Database Persistence
```typescript
// After action
const record = await getById(result.data?.id, testDb);
expect(record?.field).toBe(expectedValue);
```

### Avoiding `!` Non-Null Assertions
```typescript
// Instead of: result.data!.id
if (result.data?.id) {
  // Test assertions here
}
```

## What We Test

✅ **Schema validation** - All Zod schemas have comprehensive tests
✅ **Repository CRUD** - Create, read operations tested
✅ **Action business logic** - Auth, validation, error handling
✅ **Session management** - Create, read, expire, revoke flows
✅ **Integration** - Full stack from action to database

## What We Don't Test (Yet)

🔲 **React components** - Would need React Testing Library
🔲 **E2E flows** - Would need Playwright/Cypress  
🔲 **API endpoints** - Not applicable (using server actions)
🔲 **File uploads** - Not implemented yet
🔲 **Complex transactions** - Single operations so far

## Future Directions

### Component Testing

When we're ready to test React components:
```bash
pnpm add -D @testing-library/react @testing-library/user-event jsdom
```

### E2E Testing

For full browser flows:
```bash
pnpm add -D @playwright/test
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
- **Integration tests are slower** - Write fewer, but make them count

## Questions?

Ask in #dev channel or review existing tests for patterns.