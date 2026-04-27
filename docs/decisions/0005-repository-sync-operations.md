# ADR-0005: Repository Sync Operations for Multi-Table Entities

- **Date:** 2026-04-26
- **Status:** Accepted
- **Deciders:** Adam Dehnel

---

## Context and Problem Statement

Several entities in this application (recipe sections, recipe ingredients, recipe instructions) are owned by a parent record and managed as a complete set — a form submission represents the full desired state, not a discrete create, update, or delete. Deciding where to put the logic that reconciles the submitted state with what's in the database required a deliberate choice.

## Decision Drivers

- The diff/sync logic (compare existing records, delete removed ones, update changed ones, insert new ones) is tightly coupled to the database operations themselves
- The same pattern appears across multiple related entities and should be implemented consistently
- Actions and API handlers should stay focused on orchestration, not on the mechanics of syncing related records

## Considered Options

- Option A: Expose separate `create`, `update`, and `delete` methods and let actions orchestrate the diff
- Option B: A `sync` (or `save`) method in the repository that handles the full diff and applies all changes

## Decision Outcome

Option B. The diff logic is inseparable from the database operations — it needs to know what exists, what changed, and what was removed, all in close proximity to the operations that act on that information. Pushing it into actions would require threading more intermediate state upward and duplicating the same pattern across every caller that needs it.

Repositories are not restricted to simple CRUD — they are the project's abstraction over Drizzle, and any operation that is fundamentally about getting data in or out of the database cleanly belongs here.

### Positive Consequences

- Actions stay thin: pass the validated form data, get a result back
- The sync logic for each entity lives in one place
- Consistent pattern across sections, ingredients, and instructions

### Negative Consequences / Trade-offs

- More complexity per repository file than a simple CRUD layer
- Sync methods are harder to unit test than discrete create/update/delete operations

---

## Pros and Cons of the Options

### Option A: Actions orchestrate discrete operations

- ✅ Each repository method does one thing
- ✅ Easier to call explicit create/update/delete when needed (e.g. a PATCH endpoint)
- 🚫 Actions need to fetch existing state to perform the diff — pulling DB concerns upward
- 🚫 Same diff pattern duplicated across every caller

### Option B: Repository sync methods

- ✅ Actions stay focused on orchestration
- ✅ Single implementation of each sync pattern
- ✅ DB operations and the logic that drives them stay together
- 🚫 Sync methods are more complex than simple CRUD
- 🚫 Repositories expose both discrete and sync operations where both are needed
