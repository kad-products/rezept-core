# ADR-0013: Storybook Multi-Theme Configuration

- **Date:** 2026-07-03
- **Status:** Proposed
- **Deciders:** Adam Dehnel, Dorothy Dehnel
- **Issues:** [#523](https://github.com/kad-products/rezept-core/issues/523), [#524](https://github.com/kad-products/rezept-core/issues/524), [#525](https://github.com/kad-products/rezept-core/issues/525)

---

## Context and Problem Statement

With the design system moving to CSS modules for base component styles and two separate theme layers (admin, client) sitting on top (ADR-0012), Storybook needs to support viewing components in all three states:

1. **Base** — component with only its own `.module.css` styles, no theme applied
2. **Admin theme** — component as it appears in `/admin` pages
3. **Client theme** — component as it appears in the client-facing site

Dorothy reviews design work in Storybook. The tool needs to make switching between these states easy enough to use without developer help.

## Decision Drivers

- Dorothy should be able to preview any component in any theme without restarting Storybook or changing config files
- The base (unstyled/module-only) view matters for design system development — it shows the component's structure without visual theme opinions
- Implementation should not require duplicating stories across theme configurations
- Setup should be reasonably maintainable as new components are added

## Considered Options

- **Option A:** Separate startup commands per theme (`pnpm storybook:base`, `pnpm storybook:admin`, `pnpm storybook:client`)
- **Option B:** Storybook toolbar with theme switcher (custom global + decorator pattern)
- **Option C:** Per-story decorators that manually apply a theme class

## Decision Outcome

**Option B — Storybook toolbar with theme switcher.**

A custom Storybook global is added to the toolbar (via `.storybook/preview.ts`) that lets Dorothy switch between Base, Admin, and Client views from within the running Storybook UI. A global decorator reads the active theme selection and applies the appropriate theme CSS class to the story's root element. The theme CSS files (global LESS/CSS) are imported in `.storybook/preview.ts` and activated by the class.

This gives a single Storybook instance with all three states accessible without a restart or a developer in the room.

### Positive Consequences

- One command to start Storybook — no confusion about which command shows which theme
- Theme switching is immediate and visible in the toolbar — accessible to Dorothy without technical knowledge
- Stories are written once and work in all three theme contexts

### Negative Consequences / Trade-offs

- Slightly more complex Storybook setup than just loading a single stylesheet
- If a theme is only partially implemented, the base/theme toggle exposes the gap — which is also useful as a design review signal

---

## Pros and Cons of the Options

### Option A: Separate startup commands

- ✅ Simple to implement — just different `.storybook/` config directories loading different CSS
- ✅ No custom toolbar code
- 🚫 Dorothy must know which command to run for which context, or restart to switch
- 🚫 Three running processes if you want to compare themes side by side

### Option B: Toolbar theme switcher

- ✅ Single instance, theme switch is in the UI
- ✅ Dorothy-friendly — visual control, no terminal
- ✅ All stories benefit automatically without modification
- 🚫 Requires a custom global and decorator in `.storybook/preview.ts`
- 🚫 Theme CSS must be structured to activate via a class on the story root — requires a small convention in how theme files are written

### Option C: Per-story decorators

- ✅ Maximum control — each story can specify exactly which theme it demonstrates
- 🚫 Repetitive — every story file needs decorator boilerplate
- 🚫 Easy to forget; new stories default to unstyled and there's no obvious indicator

---

## Implementation Notes

Theme CSS files should scope their rules under a theme class (e.g. `.theme-admin`, `.theme-client`) rather than applying globally. The decorator wraps the story in a `<div>` with the active theme class. The base state applies no theme class — the component renders with only its module CSS.

Example decorator structure:

```ts
// .storybook/preview.ts
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme;
  return <div className={theme !== 'base' ? `theme-${theme}` : ''}><Story /></div>;
};
```

---

## Links and References

- [ADR-0012: Design System Styling Architecture](./0012-design-system-styling-architecture.md)
- [ADR-0007: Component Library](./0007-component-library.md)
- [Storybook globals docs](https://storybook.js.org/docs/essentials/toolbars-and-globals)
