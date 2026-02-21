# Server Actions

## Action State Pattern

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