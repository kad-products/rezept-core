# Steps

See [ADR-0004](../../docs/decisions/0004-steps-abstraction.md) for why this abstraction exists and [project architecture](../../docs/development/project-architecture.md) for where steps fit relative to other types.

## What they do

Steps are purpose-built units of data processing logic, composed by orchestrators (actions and API handlers) into pipelines. The original use case is the recipe import flow, where the same processing logic is shared between a form-based action and a bookmarklet API handler.

## When to add one

- Logic is shared between two or more actions or API handlers
- A single-use pipeline grows complex enough that keeping all of it inline would make the orchestrator hard to follow

There is no requirement to extract logic to a step — simple actions and handlers can do the work themselves.

## Error contract

Steps always throw `RzStepError` on failure. Never return an error value — throw it. This lets the orchestrator decide how to translate the error into the appropriate response format (`ActionState` for actions, `Response.json` for API handlers).

## Logging

Steps accept a `logger: RzLogger` argument. The caller is responsible for passing the logger down — steps never reach for the request context themselves. This keeps steps usable outside of request contexts.

## Guidelines

- **Named exports** — re-exported from `index.ts` so consumers import from `@/steps`.
- **Types belong in `src/types`** — step input and output types are not defined in step files. Import from `@/types`.
- **Consistent function signatures** — steps that do similar things should accept similar arguments, making orchestrators easier to read and compose.
- **One purpose per function** — a step does one thing. Compose them in the orchestrator rather than bundling multiple concerns into one step.
