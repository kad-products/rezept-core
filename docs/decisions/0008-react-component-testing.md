# ADR-0008: React Component Testing

- **Date:** 2026-05-31
- **Status:** Accepted
- **Deciders:** Adam Dehnel
- **Issue:** [#47 — React testing](https://github.com/kad-products/rezept-core/issues/47)

---

## Context and Problem Statement

Issue #47 was opened to track adding React component tests — at the time, the common go-to was React Testing Library. Since then, Playwright CT was set up in the project before a formal decision was made. The question became: lean into Playwright CT for behavioral component tests, or add RTL alongside it?

## Decision Drivers

- Already have `@playwright/experimental-ct-react` installed and configured with existing screenshot tests
- Project testing philosophy is integration-first — prefer real environments over mocked ones
- Want behavioral tests (interaction, content assertions) in addition to screenshot coverage
- Avoid maintaining two different approaches to the same layer of the stack

## Considered Options

- **Option A:** Extend Playwright CT with behavioral assertions
- **Option B:** React Testing Library + Vitest (jsdom)
- **Option C:** Storybook interaction tests

## Decision Outcome

**Option A — Playwright CT with behavioral assertions.**

Playwright CT mounts components into a real Chromium browser. We extend the existing screenshot tests with interaction-based assertions (`click`, `toContainText`, `toBeVisible`, etc.) for components that have meaningful interactive behavior. `RzDialog` is the first example: tests verify it opens on trigger click and closes on the close button.

The `page` fixture is used (alongside the `mount` fixture) when component content renders outside the mounted root via portals — which is the case for `RzDialog` and any other Radix component that uses `Dialog.Portal`.

### Positive Consequences

- No new tooling — CT is already installed, configured, and running in CI
- Real browser means the test environment matches production more closely than jsdom
- A single approach for component testing; no split between CT (visual) and RTL (behavioral)
- Consistent with the project's integration-first philosophy

### Negative Consequences / Trade-offs

- CT tests are slower than jsdom-based RTL tests — they require a browser process
- If tests get slow enough to be a problem, RTL remains available as an alternative for lightweight behavioral tests
- `@playwright/experimental-ct-react` is still experimental — API may change

---

## Pros and Cons of the Options

### Option A: Playwright CT (behavioral)

- ✅ Already installed and configured
- ✅ Real browser — no jsdom approximations
- ✅ Screenshot and behavioral tests in one framework
- ✅ Supports portal-rendered content via the `page` fixture
- 🚫 Slower than jsdom (browser startup per test run)
- 🚫 Experimental package — API stability not guaranteed

### Option B: React Testing Library + Vitest

- ✅ Fast — runs in Node with jsdom, alongside existing Vitest tests
- ✅ Large ecosystem, well-documented, widely understood
- 🚫 jsdom is a simulated browser — some APIs are missing or differ from real browsers
- 🚫 Would be a second component testing approach alongside Playwright CT, creating split conventions
- 🚫 Portal rendering requires additional jsdom configuration

### Option C: Storybook interaction tests

- ✅ Tests live alongside stories — one file covers both design review and behavioral testing
- ✅ Good fit for Dorothy's design workflow
- 🚫 Adds another test runner (Storybook test runner) to maintain
- 🚫 Stories aren't always the right shape for covering edge cases and error states
- 🚫 Coupling test coverage to Storybook adds friction for developer-focused test work

RTL remains a valid fallback if CT proves too slow for a specific component or if a test genuinely needs tight control over mocked internals.

---

## Conventions

- Component tests use the `.ct.test.tsx` extension and live alongside the component they test (e.g. `RzCard.ct.test.tsx` next to `RzCard.tsx`)
- CT coverage is scoped to design-system components (`src/components/design-system/`); single-use page-level components are left untested at this layer
- Use `mount` for rendering, `page` when querying content that renders via a portal
- Behavioral tests and screenshot tests can coexist in the same file — start behavioral for components with interactive behavior, add screenshots if visual regression coverage is needed too

---

## Links and References

- [Playwright CT docs](https://playwright.dev/docs/test-components)
- [ADR-0001: Form Management Library](./0001-form-management-library.md)
