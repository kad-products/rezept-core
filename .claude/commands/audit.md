Audit `src/` for deviations from the documented patterns in each directory's `readme.md`. Compare implementation files against the standards and report findings.

## Scope

If `$ARGUMENTS` names a specific directory (e.g. `repositories`, `actions`, `pages`), scan only that directory. If no argument is given, scan all directories in the order listed below — this is a full codebase audit and will be expensive.

Directories to audit (in order):
- `src/interrupters/`
- `src/middleware/`
- `src/steps/`
- `src/schemas/`
- `src/repositories/`
- `src/actions/`
- `src/api/`
- `src/pages/`
- `src/forms/`
- `src/components/`
- `src/layouts/`
- `src/types/`
- `src/models/`
- `src/durable-objects/`

## Process for each directory

1. Read the directory's `readme.md` to establish the current canonical pattern
2. Read all implementation files in that directory (skip `__tests__/` on the first pass)
3. Compare each file against the documented standards
4. Spot-check `__tests__/` for coverage gaps and test pattern violations
5. Note any deviations — err on the side of flagging rather than dismissing

## What to look for

**Structure and patterns**
- Files not following the structural pattern in the README (e.g. missing `serverAction()` wrapper, bare `async function` instead of the documented pattern)
- Wrong or missing directives (`'use server'`, `'use client'`)
- Naming convention violations (component names, file names, function name prefixes like `_fn`)

**Imports and boundaries**
- Types defined outside `src/types/` (inline in action, form, repository, or schema files)
- Runtime code in `src/types/` (classes, functions — only type definitions belong there)
- Imports from individual repository or action files instead of barrel exports (where barrel exports are documented)
- Types imported from `@/repositories/*` or `@/actions/*` instead of `@/types`
- Circular dependencies between layers (e.g. types importing from schemas)

**Auth and permissions**
- Missing `requireAuthentication` in handler or route chains where it's expected
- Inline `if (!userId)` guards inside implementation functions instead of using interruptors
- Authorization logic inside repositories
- Wrong HTTP status codes for auth failures (401 vs 400)

**Error handling**
- `console.log` in server-side code (allowed in `src/components/`, `src/forms/`, `src/layouts/`; disallowed everywhere else)
- Manual `Response` construction instead of `Response.json()`
- Duplicated error message logic that should be extracted to a utility
- Dead code guards after repository calls that throw on not-found

**Tests**
- Missing test files for directories where tests are expected
- Placeholder tests (`expect(true).toBe(true)`)
- Tests mocking at the wrong level

**Other**
- Unused exports (types, functions) with no consumers
- Incorrect return types (e.g. `Promise<T | undefined>` when the function always throws)
- Missing explicit return types on exported functions
- Unnecessary `async` on functions with no `await`
- Debug output left in production code (`JSON.stringify(ctx)` in rendered JSX, etc.)

## Output format

Present findings as a bullet list grouped by directory. For each finding include:
- What the deviation is
- The specific file and line number
- Which README rule it violates (quote it if helpful)

After presenting findings for each directory, pause and ask the user which should become GitHub issues before moving to the next directory — or, if the user asked for a full scan up front, present all findings first and then ask.

Do NOT create GitHub issues automatically. Always confirm with the user first.

## Reference

Each directory's `readme.md` is the authoritative standard for that type. Also consult:
- `docs/development/project-architecture.md` — overall type map, import rules, key constraints
- `.claude/CLAUDE.md` — tech stack, architecture patterns summary, testing layers
