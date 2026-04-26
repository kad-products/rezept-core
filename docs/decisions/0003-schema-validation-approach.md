# ADR-0003: Schema Validation Approach

- **Date:** 2026-04-26
- **Status:** Accepted
- **Deciders:** Adam Dehnel

---

## Context and Problem Statement

The app needs a consistent way to validate incoming data from forms and API calls before it reaches the data layer. The project uses Drizzle ORM for database models, which has a companion library (drizzle-zod) for inferring Zod schemas directly from model definitions.

## Decision Drivers

- Validation needs to work for both create and edit operations, which often have different shapes
- Complex forms have fields that don't map cleanly to database columns
- Schemas need to be maintainable without requiring changes to database models

## Considered Options

- Option A: Infer schemas from Drizzle models via drizzle-zod
- Option B: Hybrid — infer from models and override as needed
- Option C: Standalone Zod schemas, independent of models

## Decision Outcome

Option C. The inference approach seemed attractive for keeping schemas in sync with models, but in practice it created more friction than it saved. Edit vs. create operations need different shapes, complex forms have fields that span multiple tables or don't exist in the model at all, and overriding inferred schemas ends up being harder to read than just writing them directly.

Schemas in `src/schemas/` are now pure input validators — they describe what the caller is allowed to send, not what the database looks like.

### Positive Consequences

- Schemas are straightforward to write and read
- No coupling between form shape and database shape
- Create and edit schemas can differ freely

### Negative Consequences / Trade-offs

- Schema and model can drift out of sync without a compiler forcing alignment
- Some duplication of field definitions between models and schemas

---

## Pros and Cons of the Options

### Option A: Drizzle-inferred schemas

- ✅ Single source of truth for field types
- ✅ Schema stays in sync with model automatically
- 🚫 Edit vs. create shapes require awkward workarounds
- 🚫 Complex forms with cross-table or derived fields break the pattern

### Option B: Hybrid inference + overrides

- ✅ Gets some free alignment on simple cases
- 🚫 Mixed approach is harder to follow than a consistent one
- 🚫 Still hits the same edge cases as full inference, just later

### Option C: Standalone Zod schemas

- ✅ Simple and consistent — schemas are just validators
- ✅ No constraints from the model shape
- 🚫 Requires discipline to keep schemas and models aligned
