# Storybook — Component Contribution Guide

This guide covers how to get Storybook running locally and make design or component changes. You don't need to set up the full Rezept app to work on components — Storybook runs independently.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`
- [Git](https://git-scm.com/)

If you've worked on a Next.js project before, your machine is probably already set up.

## Setup

Check out the [**video walkthrough**](../videos/storybook.mp4) of this setup if that's more your style.

### 1. Follow Get Started

Follow the [Getting Started](./getting-started.md) docs to get your local environment setup.

### 2. Start Storybook

```bash
pnpm storybook:dev
```

Storybook opens at `http://localhost:6006`. The left sidebar lists all components and their stories. Changes to component files and stylesheets hot-reload automatically.

## How stories are structured

Each component lives in `src/components/`. Stories for a component sit in the same folder as the component itself, in a file named `ComponentName.stories.tsx`.

```
src/components/
  RzCard.tsx              ← the component
  RzCard.stories.tsx      ← its stories
  RzDialog.tsx
  RzDialog.stories.tsx
```

A story file looks like this:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import RzCard from './RzCard';

const meta: Meta<typeof RzCard> = {
  component: RzCard,
};
export default meta;

type Story = StoryObj<typeof RzCard>;

export const Default: Story = {
  args: {
    title: 'Summer Pasta',
    actions: [{ href: '#', text: 'View' }],
  },
};
```

Each named export (`Default`, `WithBody`, etc.) becomes one entry in the Storybook sidebar. The `args` object maps to the component's props — Storybook automatically generates controls for them so you can tweak values in the browser without editing code.

See the [Storybook writing stories guide](https://storybook.js.org/docs/writing-stories) for the full picture.

## Adding a new story

1. Open (or create) the `<ComponentName>.stories.tsx` file for the component you want to document
2. Add a new named export with the props you want to demonstrate
3. Save — Storybook picks it up immediately, no restart needed

## Making a CSS change

Styles live in `src/styles/`. Each component has its own LESS file (e.g. `rz-card.less`) that is imported into `global.css`. To change a component's styles:

1. Open the corresponding `.less` file in `src/styles/`
2. Edit and save — Storybook hot-reloads the styles automatically

If you're adding a brand-new component with new styles, create a `your-component.less` file in `src/styles/` and add an `@import` line for it in the alphabetical order listing at the top of `src/styles/global.css`.

## Publishing Changes

One changes are ready we can follow our standard PR to `main` workflow to publish. The latest Storybook build is published to the [project dashboard](https://kad-products.github.io/rezept-core/) under **Design → Storybook** after each release. Use the local dev server for active work; the published site is just for reference.

1. Commit the changes
2. Push to GitHub
3. Create a PR
4. Merge (after CI passes)
5. Post-merge workflows will run and push to the dashboard

## Further reading

- [Storybook docs — Writing stories](https://storybook.js.org/docs/writing-stories)
- [Storybook docs — Args](https://storybook.js.org/docs/writing-stories/args)
- [Storybook docs — Controls](https://storybook.js.org/docs/essentials/controls)
