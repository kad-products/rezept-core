# Actions vs Repositories

## Separation of Concerns

### Repositories: Data Access Layer
**Responsibility:** CRUD operations on database tables
```typescript
// repositories/seasons.ts
export async function createSeason(data: SeasonFormData, userId: string) {
  const [created] = await db
    .insert(seasons)
    .values({
      ...data,
      createdBy: userId,
    })
    .returning();
    
  return created;
}

export async function getSeasonById(seasonId: string): Promise<Season> {
  const results = await db.select().from(seasons).where(eq(seasons.id, seasonId));
  if (results.length !== 1) {
    throw new Error(`Season not found: ${seasonId}`);
  }
  return results[0];
}
```

**Repositories should:**
- Contain ONLY database operations
- Throw meaningful errors
- Return typed results
- Handle transactions when needed
- Use batch operations for related data (e.g., `updateSectionsForRecipe`)

**Repositories should NOT:**
- Validate input (that's the action's job)
- Check authentication
- Contain business logic
- Call other repositories (with rare exceptions for truly atomic operations)

### Actions: Business Logic Layer
**Responsibility:** Orchestrate operations, validate, enforce rules
```typescript
// actions/seasons.ts
export async function saveSeason(formData: unknown): Promise<ActionState<{ id: string }>> {
  // 1. Check authentication
  const userId = requestInfo.ctx.user?.id;
  if (!userId) {
    return { success: false, errors: { _form: ['You must be logged in'] } };
  }

  // 2. Validate input
  const validation = createSeasonSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors };
  }

  // 3. Business logic / orchestration
  try {
    const season = await createSeason(validation.data, userId);
    return { success: true, data: { id: season.id } };
  } catch (error) {
    return { success: false, errors: { _form: ['Failed to save season'] } };
  }
}
```

**Actions should:**
- Validate all input with Zod schemas
- Check authentication/authorization
- Orchestrate multiple repository calls
- Handle errors gracefully
- Return ActionState for consistent client handling
- Add audit fields (createdBy, updatedBy) before calling repositories

**Actions should NOT:**
- Write SQL queries directly
- Import `db` directly
- Return raw database records (transform if needed)

## Pattern: Complex Multi-Table Operations

For operations spanning multiple tables (like saving a recipe with sections/ingredients/instructions):

**Repository handles the batch:**
```typescript
// repositories/recipe-sections.ts
export async function updateSectionsForRecipe(
  recipeId: string,
  sections: RecipeSectionFormSave[],
  userId: string
) {
  // Transaction handles create/update/delete as one atomic operation
  await db.transaction(async (tx) => {
    // Existing logic for diffing and updating
  });
}
```

**Action orchestrates the pieces:**
```typescript
// actions/recipes.ts
export async function saveRecipe(formData: RecipeFormData): Promise<ActionState> {
  // Validate & auth checks...
  
  const recipe = await createRecipe(validated.data, userId);
  await updateSectionsForRecipe(recipe.id, validated.sections, userId);
  await updateRecipeIngredients(recipe.id, validated.ingredients, userId);
  await updateRecipeInstructions(recipe.id, validated.instructions, userId);
  
  return { success: true, data: { id: recipe.id } };
}
```

**Why batch methods in repositories?**
- Transaction management belongs at the data layer
- Reduces N+1 query issues
- Action stays focused on orchestration, not iteration
- Better performance

## Anti-Patterns to Avoid

❌ **Business logic in repositories:**
```typescript
// repositories/seasons.ts - DON'T DO THIS
export async function createSeason(data: unknown, userId: string) {
  const validated = createSeasonSchema.parse(data); // Validation should be in action
  if (!userId) throw new Error('Unauthorized'); // Auth should be in action
  // ...
}
```

❌ **Direct DB access in actions:**
```typescript
// actions/seasons.ts - DON'T DO THIS
import db from '@/db';
export async function saveSeason(data: unknown) {
  const [season] = await db.insert(seasons).values(data).returning(); // Use repository
}
```

❌ **Repository calling repository (usually):**
```typescript
// repositories/recipes.ts - AVOID
export async function createRecipe(data: RecipeFormData, userId: string) {
  const recipe = await db.insert(recipes).values(data).returning();
  await createRecipeSection(recipe.id, data.sections[0], userId); // Let action orchestrate
}
```

## Decision Tree

**"Should this logic be in the action or repository?"**

1. Does it involve **authentication/authorization**? → Action
2. Does it **validate user input**? → Action
3. Does it **query/modify the database**? → Repository
4. Does it **orchestrate multiple database operations**? → Action calls multiple repositories
5. Does it **transform data for the client**? → Action
6. Does it **handle transactions across tables**? → Repository (batch method)

When in doubt: **Actions orchestrate, repositories execute.**