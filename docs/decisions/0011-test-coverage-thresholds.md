# ADR-0011: Test Coverage Thresholds by Directory

- **Date:** 2026-06-02
- **Status:** Accepted
- **Deciders:** Adam Dehnel

---

## Context and Problem Statement

Different parts of the codebase have meaningfully different testing expectations. A blanket global threshold either sets the bar too low for critical layers or too high for layers where unit testing has inherent limits. Per-directory thresholds in `vitest.config.ts` make the expectations explicit and enforced by CI.

The thresholds track a single metric — **branch coverage** — because branches are the most meaningful signal: an uncovered branch is a code path that has never been exercised, which is where bugs hide.

## Standard

The intent is **100% branch coverage on all server-side logic layers**. Directories currently below 100% are tracked as known tech-debt, not as ratified exceptions.

### Target thresholds (all layers)

| Directory              | Target | Current | Notes       |
| ---------------------- | ------ | ------- | ----------- |
| `src/schemas/`         | 100%   | 100%    | ✅           |
| `src/repositories/`    | 100%   | 100%    | ✅           |
| `src/api/`             | 100%   | 100%    | ✅           |
| `src/middleware/`      | 100%   | 100%    | ✅           |
| `src/interrupters/`    | 100%   | 100%    | ✅           |
| `src/durable-objects/` | 100%   | 100%    | ✅           |
| `src/actions/`         | 100%   | 85%     | ⚠️ tech-debt |
| `src/steps/`           | 100%   | 74%     | ⚠️ tech-debt |
| `src/classes/`         | 100%   | 66%     | ⚠️ tech-debt |

### Excluded from coverage

`src/components/`, `src/pages/`, `src/layouts/`, and `src/styles/` are excluded from unit coverage entirely. These are UI layers tested through other mechanisms (Storybook component tests, Playwright E2E). Unit coverage numbers for React components are not a meaningful signal.

### Global fallback

A global floor of `branches: 66, lines: 30` catches any new directory that doesn't have an explicit threshold yet. The `lines: 30` floor exists specifically to surface dead code or accidentally untested files rather than to set a meaningful quality bar — any new directory should get its own explicit threshold promptly.

## Rationale for 100% on server-side logic

The server-side logic layers (schemas, repositories, actions, steps, middleware, interrupters, API handlers) are pure TypeScript with no UI concerns. They are fully testable in isolation with mocked dependencies. An uncovered branch in any of these layers is a bug waiting to happen — not an acceptable trade-off.

100% branch coverage does not mean every line is tested for its own sake. It means every decision point in the code has been exercised. The project's testing patterns (unit tests for actions/middleware with mocked repositories, integration tests for repositories with in-memory SQLite) make this achievable without excessive test complexity.

## Closing the gaps

The three directories currently below 100% will be brought up incrementally as part of normal feature work — not as a dedicated coverage effort:

- **`src/actions/`** — each new or modified action should ship with complete branch coverage; existing gaps close over time
- **`src/steps/`** — same approach
- **`src/classes/`** — small directory; a focused pass would likely close this quickly

When a directory reaches 100%, its threshold in `vitest.config.ts` should be updated to enforce it.
