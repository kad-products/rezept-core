# ADR-0004: Steps Abstraction for Shared Pipeline Logic

- **Date:** 2026-04-26
- **Status:** Accepted
- **Deciders:** Adam Dehnel

---

## Context and Problem Statement

The recipe import feature requires similar data processing logic in two entry points: a server action (form-based) and an API handler (bookmarklet). Both need to validate, transform, and persist recipe data. Without an explicit abstraction, this logic either gets duplicated or lands in a generic shared folder.

## Decision Drivers

- Avoid duplicating data processing logic across entry points
- Avoid a generic `utils/` folder that becomes a junk drawer over time
- Keep actions and API handlers focused on orchestration rather than implementation detail

## Considered Options

- Option A: Duplicate the logic in each entry point
- Option B: Shared `utils/` folder
- Option C: Named `steps/` abstraction with a defined purpose and error contract

## Decision Outcome

Option C. The name comes loosely from AWS Step Functions — individual, purpose-built pieces of a data processing pipeline that can be composed by an orchestrator. Steps throw a typed error (`RzStepError`) and leave response formatting to the caller, which keeps them usable from both actions and API handlers without either one having to accommodate the other's response shape.

### Positive Consequences

- Shared logic has a deliberate home with a defined contract
- Actions and API handlers stay thin orchestrators
- The pattern scales if more shared pipelines emerge

### Negative Consequences / Trade-offs

- Adds a layer that simple features don't need — the pattern shouldn't be applied just because it exists
- The complexity threshold for when to extract to a step is a judgement call

---

## Pros and Cons of the Options

### Option A: Duplicate logic

- ✅ No abstraction overhead for simple cases
- 🚫 Changes need to be made in multiple places
- 🚫 Logic drifts between entry points over time

### Option B: Utils folder

- ✅ Easy to reach for
- 🚫 No defined purpose or contract — tends to accumulate unrelated code
- 🚫 Provides a home but no guidance

### Option C: Steps abstraction

- ✅ Named, purposeful, with a defined error contract
- ✅ Keeps orchestrators clean
- 🚫 Requires judgement about when to use it vs. just doing the work inline
