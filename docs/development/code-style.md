# Code Style

## Formatting

- Biome for linting and formatting
- Configuration in `biome.json`
- Run `pnpm format` before committing

## Naming Conventions

- **Files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx`
- **Functions**: `camelCase()`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE` (only for true constants)

## Import Organization

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
