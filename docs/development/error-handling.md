# Error Handling Patterns

## `getById()` Functions: Throw on Not Found

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