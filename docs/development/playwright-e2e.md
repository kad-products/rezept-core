# Playwright E2E Tests — Guide

This guide covers how to write and run Playwright end-to-end tests. E2E tests run against the full app in a real browser — they verify that pages load, navigate, and behave correctly from a user's perspective.

E2E coverage is currently light (listing pages only). The intent is to grow it over time to cover critical user flows like authentication, recipe creation, and search.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`
- Playwright browsers installed (see Setup below)
- A running local dev environment (the test runner starts it for you — see below)

## Setup

Check out the [**video walkthrough**](../videos/playwrite-e2e.mp4) of this setup if that's more your style.

### 1. Follow Getting Started

Follow the [Getting Started](./getting-started.md) docs to get your local environment set up, including the local database.

### 2. Install Playwright browsers

```bash
pnpm exec playwright install chromium
```

You only need to do this once per machine (and again after a Playwright version bump).

## Running the tests

```bash
# Run all E2E tests once
pnpm playwright-e2e:run

# Open the interactive UI (watch mode, re-runs on save)
pnpm playwright-e2e:ui
```

The dev server starts automatically before the tests run (via `webServer` in `playwright.config.ts`) and shuts down when they finish. If you already have the dev server running on port 5173, Playwright will reuse it rather than starting a new one.

The HTML report is saved to `playwright-report/`. Open `playwright-report/index.html` to browse failures with traces and screenshots.

## File conventions

E2E test files use the `.e2e.test.ts` extension and live in a `__tests__/` folder alongside the page they test:

```
src/pages/
  recipes/
    __tests__/
      listing.e2e.test.ts
  seasons/
    __tests__/
      listing.e2e.test.ts
```

Import from `@playwright/test`:

```ts
import { expect, test } from '@playwright/test';
```

## Writing tests

### Basic page test

Navigate to a URL and assert on the page content:

```ts
import { expect, test } from '@playwright/test';

test('renders recipes listing page', async ({ page }) => {
  await page.goto('/recipes');
  await expect(page.locator('h2.page-title')).toHaveText('Recipes');
});
```

The `baseURL` is set to `http://localhost:5173` in `playwright.config.ts`, so relative paths work in `page.goto()`.

### Interaction test

Use Playwright's locators to click, fill forms, and assert on resulting state:

```ts
test('creates a new season', async ({ page }) => {
  await page.goto('/seasons/new');

  await page.getByLabel('Name').fill('Summer 2026');
  await page.getByLabel('Country').selectOption('US');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Summer 2026')).toBeVisible();
});
```

### Authenticated flows

Pages behind authentication will redirect to the login page if no session exists. For tests that require a logged-in user, you'll need to set up a session fixture. This is not yet implemented — see [Future work](#future-work) below.

## What to test

E2E tests are for flows that cross multiple layers of the stack — routing, middleware, server actions, and the database all working together. Good candidates:

- **Page rendering** — the right content appears at the right URL
- **Form flows** — submit a form, verify the result appears (or the error is shown)
- **Navigation** — links go where they should, redirects work correctly
- **Auth gates** — unauthenticated requests redirect to login

Avoid testing things that are already covered at a lower layer (schema validation, repository logic, individual component behavior). E2E tests are slower and more fragile — keep them focused on flows that can only be verified with the full stack running.

## Future work

- **Auth fixtures** — a `loggedInPage` fixture that sets a session cookie so tests can reach authenticated routes without going through the passkey flow
- **Seed data** — a per-test database seed so tests can assert against known data rather than an empty database
- **More flows** — recipe creation/editing, ingredient management, permission override

## CI

E2E tests run automatically on every PR via `.github/workflows/playwright-e2e.yaml`. The Playwright HTML report is uploaded as a build artifact and kept for 30 days. The report is also published to the [project dashboard](https://kad-products.github.io/rezept-core/) under **Reports → E2E** after each release.

## Further reading

- [Playwright docs](https://playwright.dev/docs/writing-tests)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
