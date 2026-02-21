# Database Patterns

## Repository Layer

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

## No Database Parameters in Production Code

**Don't do this:**
```typescript
export async function getSeason(id: string, database: TestableDB = db) {
  // ...
}
```

**Why?** Test concerns shouldn't leak into production code. Use the database proxy pattern instead (see Testing Guide).