# Understanding Tests - Guide for QA/PO

This guide helps you read and understand our automated tests to verify feature coverage and identify missing scenarios.

## Why Automated Tests Matter

Automated tests:
- Document what the system does
- Catch bugs before production
- Verify acceptance criteria are met
- Make refactoring safer

**Your role:** Verify that tests cover all acceptance criteria and edge cases from user stories.

## Types of Tests

We have three main types of tests in this project:

### 1. Schema Tests (`src/schemas/__tests__/`)

**What they test:** Data validation rules

**Example:**
```typescript
it('rejects invalid country code', () => {
  const result = schema.safeParse({ country: 'USA' }); // Must be 2 letters
  expect(result.success).toBe(false);
});
```

**What this tells you:** The system won't accept 3-letter country codes.

**When to care:** When verifying data validation requirements from stories.

### 2. Unit Tests (`*.test.ts` files)

**What they test:** Individual pieces in isolation

**Example:**
```typescript
it('rejects unauthenticated requests', async () => {
  mockRequestInfo.ctx.user = null; // Simulate logged-out user
  
  const result = await saveSeason(formData);
  
  expect(result?.success).toBe(false);
  expect(result?.errors?._form).toContain('You must be logged in');
});
```

**What this tells you:** Users must be logged in to save seasons.

**When to care:** When verifying business rules and auth requirements.

### 3. Integration Tests (`*.integration.test.ts` files)

**What they test:** Full workflows end-to-end

**Example:**
```typescript
it('creates season and persists to database', async () => {
  const result = await saveSeason(formData);
  
  expect(result?.success).toBe(true);
  
  // Verify it's actually saved
  const season = await getSeasonById(result.data.id);
  expect(season?.name).toBe('Spring Season');
});
```

**What this tells you:** The complete flow works - validation, saving, and retrieval.

**When to care:** When verifying end-to-end user journeys.

## How to Read a Test

Tests follow a common pattern:
```typescript
describe('Feature Name', () => {          // What's being tested
  
  it('does something specific', async () => {  // Specific scenario
    
    // ARRANGE - Set up test data
    const formData = new FormData();
    formData.set('name', 'Test');
    
    // ACT - Do the thing
    const result = await saveSeason(formData);
    
    // ASSERT - Verify it worked
    expect(result?.success).toBe(true);
  });
});
```

### Reading `describe` blocks
```typescript
describe('saveSeason', () => {
  describe('authentication', () => {
    // Tests about auth requirements
  });
  
  describe('create season', () => {
    // Tests about creating new seasons
  });
  
  describe('update season', () => {
    // Tests about updating existing seasons
  });
});
```

**Nested `describe` blocks organize related scenarios.**

### Reading `it` blocks
```typescript
it('validates country code format', () => {
  // This test verifies country codes must be 2 letters
});

it('requires authentication', () => {
  // This test verifies users must be logged in
});
```

**The `it` description tells you exactly what's being verified.**

### Reading Expectations
```typescript
expect(result?.success).toBe(true);
// ✅ Operation succeeded

expect(result?.success).toBe(false);
// ❌ Operation failed (as expected for error cases)

expect(result?.errors?.country).toBeDefined();
// ✅ Error message exists for country field

expect(season?.name).toBe('Spring Season');
// ✅ Data was saved correctly
```

## Understanding Mocks

**What is mocking?** Replacing real dependencies with fake versions for testing.

**Why mock?** To test one piece without depending on others.

### Common Mocks You'll See
```typescript
mockRequestInfo.ctx.user = null;
// Simulates: user is logged out

mockRequestInfo.ctx.user = { id: 'test-user-id' };
// Simulates: user is logged in

vi.mocked(createSeason).mockRejectedValueOnce(new Error('Database error'));
// Simulates: database failure
```

**What this means:** Tests can simulate different scenarios (logged in/out, errors) without real users or real errors.

## Mapping Tests to Acceptance Criteria

### Example Story:
```
As a user
I want to create a season
So that I can track when ingredients are available

Acceptance Criteria:
- Must be logged in
- Name is required
- Country must be valid 2-letter code  
- Must save to database
- Should handle errors gracefully
```

### Finding Coverage:

**Auth requirement:**
```typescript
it('requires authentication', async () => {
  mockRequestInfo.ctx.user = null;
  // ... verifies rejection
});
```
✅ Covered

**Name required:**
```typescript
it('validates required fields', async () => {
  // ... missing name
  expect(result?.errors?.name).toBeDefined();
});
```
✅ Covered

**Country validation:**
```typescript
it('validates country code format', async () => {
  formData.set('country', 'USA');
  expect(result?.errors?.country).toBeDefined();
});
```
✅ Covered

**Saves to database:**
```typescript
it('creates season and persists to database', async () => {
  // ... saves, then retrieves to verify
});
```
✅ Covered (integration test)

**Error handling:**
```typescript
it('handles repository errors gracefully', async () => {
  // ... simulates database error
  expect(result?.errors?._form).toBeDefined();
});
```
✅ Covered

## Identifying Missing Scenarios

### Questions to Ask:

1. **Happy path covered?**
   - Can users complete the task successfully?
   
2. **Error cases covered?**
   - What if data is invalid?
   - What if user lacks permission?
   - What if system has errors?

3. **Edge cases covered?**
   - Minimum/maximum values
   - Empty vs missing data
   - Special characters
   - Concurrent operations

4. **Different user types covered?**
   - Logged in vs logged out
   - Different permissions
   - Different roles

### Example Missing Scenarios:

Looking at season tests, we might notice:
- ❓ What if name is very long (1000+ characters)?
- ❓ What if two users create the same season simultaneously?
- ❓ What if user tries to update someone else's season?

**These could be new tests to add!**

## Where to Find Tests
```
src/
  schemas/__tests__/
    - Data validation tests
    - Check: field requirements, formats, ranges
  
  repositories/__tests__/
    - Database operation tests
    - Check: CRUD operations work
  
  actions/__tests__/
    *.test.ts - Business logic tests (unit)
    - Check: auth, validation, error handling
    
    *.integration.test.ts - Full flow tests
    - Check: end-to-end user journeys
  
  session/__tests__/
    - Auth and session tests
    - Check: login, logout, expiration
```

## What We Test Now

✅ **Seasons** - Create, update, validation, auth
✅ **Users** - Create, retrieve  
✅ **Credentials** - WebAuthn passkey management
✅ **Sessions** - Auth state, expiration
✅ **Data validation** - All input validation rules

## What We'll Test in Future

🔲 **Recipes** - Complex multi-step creation
🔲 **Lists** - Shopping list management
🔲 **Ingredients** - Ingredient library
🔲 **UI Components** - React component behavior
🔲 **Full user journeys** - Browser-based E2E tests

## Running Tests Yourself
```bash
# See all tests pass/fail
pnpm test

# Run specific feature tests
pnpm test seasons

# Run just unit tests (fast)
pnpm test -- --exclude **/*.integration*

# Run just integration tests
pnpm test integration
```

## When Tests Fail

Failed tests mean:
- Code change broke existing functionality
- New requirement conflicts with old behavior
- Bug was caught before production 🎉

**Your job:** Help determine if the test needs updating (requirements changed) or if there's a real bug.

## Tips for Reviewing Test Coverage

1. **Start with integration tests** - They show complete user journeys
2. **Check unit tests for edge cases** - They cover error scenarios
3. **Review schema tests for data rules** - They document all validation
4. **Look for missing negative tests** - "What should NOT work?"
5. **Map to acceptance criteria** - Check off each requirement

## Questions?

Ask Adam or review the tests together during sprint planning.