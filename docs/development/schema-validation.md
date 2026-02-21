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
