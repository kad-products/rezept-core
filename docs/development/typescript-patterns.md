# TypeScript Patterns

## Avoid `any` Unless Necessary

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