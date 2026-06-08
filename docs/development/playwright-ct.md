# Playwright Component Tests — Guide

This guide covers how to write and run Playwright component tests. Component tests mount React components into a real Chromium browser and let you make behavioral and visual assertions without running the full app.

See [ADR-0008](../decisions/0008-react-component-testing.md) for why we chose Playwright CT over React Testing Library.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`
- Playwright browsers installed (see Setup below)

## Setup

### 1. Follow Getting Started

Follow the [Getting Started](./getting-started.md) docs to get your local environment set up and dependencies installed.

### 2. Install Playwright browsers

Playwright downloads its own browser binaries separately from `pnpm install`:

```bash
pnpm playwright install chromium
```

You only need to do this once per machine (and again after a Playwright version bump).

## Running the tests

```bash
# Run all component tests once
pnpm playwright-ct:run

# Open the interactive UI (watch mode, re-runs on save)
pnpm playwright-ct:ui

# Update stored screenshots after an intentional visual change
pnpm playwright-ct:update
```

The HTML report from `playwright-ct:run` is saved to `playwright-report/`. Open `playwright-report/index.html` to browse failures with screenshots and traces.

## File conventions

Component test files use the `.ct.test.tsx` extension and live alongside the component they test. CT coverage is scoped to design-system components — single-use page-level components are left untested at this layer:

```
src/components/
  design-system/
    card/
      RzCard.tsx
      RzCard.ct.test.tsx       ← tests live next to the component
    dialog/
      RzDialog.tsx
      RzDialog.ct.test.tsx
    table/
      RzTable.tsx
      RzTable.ct.test.tsx
```

Import from `@playwright/experimental-ct-react`, not from `@playwright/test`:

```tsx
import { expect, test } from '@playwright/experimental-ct-react';
```

## Writing tests

### Basic rendering test

Use `mount` to render a component and make assertions against the returned locator:

```tsx
import { expect, test } from '@playwright/experimental-ct-react';
import RzCard from './RzCard';

test('renders title and actions', async ({ mount }) => {
  const component = await mount(
    <RzCard
      title="Pasta Carbonara"
      actions={[{ href: '/recipes/1', text: 'View' }]}
    />,
  );
  await expect(component).toContainText('Pasta Carbonara');
  await expect(component).toContainText('View');
});
```

### Screenshot test

`toHaveScreenshot()` captures a PNG on first run and diffs against it on subsequent runs. Use it for design-system components where you want visual regression coverage:

```tsx
test('renders title and actions', async ({ mount }) => {
  const component = await mount(
    <RzCard title="Pasta Carbonara" actions={[{ href: '/recipes/1', text: 'View' }]} />,
  );
  await expect(component).toHaveScreenshot();
});
```

Screenshots are stored next to the test file in a `__snapshots__` folder (committed to git). When you intentionally change a component's appearance, run `pnpm playwright-ct:update` to regenerate them.

### Interactive / behavioral test

Use the `page` fixture for interaction (`click`, keyboard, etc.) and content assertions on the component's internal state:

```tsx
test('shows validation error when field is empty', async ({ mount, page }) => {
  await mount(<MyForm />);

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('This field is required')).toBeVisible();
});
```

### Portal-rendered content

Some Radix UI components (`RzDialog` and others that use `*.Portal`) render their content outside the mounted component's DOM subtree and into `document.body`. The `component` locator won't find that content — use `page` instead:

```tsx
test('opens when trigger is clicked', async ({ mount, page }) => {
  await mount(
    <RzDialog trigger={<button type="button">Open</button>} title="Confirm Action">
      <p>Dialog body content</p>
    </RzDialog>,
  );

  // Dialog is not yet visible
  await expect(page.getByRole('dialog')).not.toBeVisible();

  await page.getByRole('button', { name: 'Open' }).click();

  // Content lives in the portal, so query via `page`
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Confirm Action');
});
```

**Rule of thumb:** if `component.getBy*()` returns nothing and you expect it should, try `page.getBy*()` — you're probably dealing with a portal.

## What to test

CT coverage is scoped to design-system components (`src/components/design-system/`). Single-use page-level components are left untested at this layer — they're better verified by running the app.

For design-system components:
- **Behavioral tests** for any component with interaction: clicks, toggles, keyboard navigation, conditional rendering based on props
- **Screenshot tests** where you want visual regression coverage against unintentional appearance changes
- Both can coexist in the same file

## CI

Component tests run automatically on every PR via `.github/workflows/playwright-ct.yaml`. The Playwright HTML report is uploaded as a build artifact and kept for 30 days — useful for reviewing screenshot diffs on a failing PR.

## Further reading

- [Playwright CT docs](https://playwright.dev/docs/test-components)
- [Playwright locators](https://playwright.dev/docs/locators)
- [ADR-0008 — React Component Testing](../decisions/0008-react-component-testing.md)
