# ADR-0012: Design System Styling Architecture — CSS Modules and Theme Layers

- **Date:** 2026-07-03
- **Status:** Accepted
- **Deciders:** Adam Dehnel, Dorothy Dehnel

---

## Context and Problem Statement

A second project is anticipated that would reuse the Rezept design system components. The current styling approach — global LESS files compiled alongside app styles — couples component styles to the app and makes them difficult to lift out. Additionally, the admin section (`/admin`) and the client-facing section need distinct visual treatments, which requires a clear separation between what is the component's base functional style and what is an app-specific theme.

## Decision Drivers

- Design system components should be portable to a second project without carrying app-specific styles with them
- Admin pages and client pages need different visual themes
- Base component styles (structure, layout, functional defaults) should be separable from visual theme styles (color, typography, spacing choices)
- The styling approach should not require a build-time dependency on the consuming app

## Considered Options

- **Option A:** CSS Modules for base styles + separate global CSS/LESS theme files
- **Option B:** Continue with global LESS, namespace admin vs client styles
- **Option C:** CSS-in-JS (e.g. vanilla-extract)

## Decision Outcome

**Option A — CSS Modules for base styles, separate global theme files.**

Each design system component gets a colocated `.module.css` file for its base functional styles — layout, structure, spacing defaults. These styles are scoped to the component and travel with it.

On top of that, two theme layers are maintained as separate global CSS (or LESS) files:

- **Admin theme** — applied to `/admin` pages
- **Client theme** — applied to the rest of the site

Themes override or extend the component's base styles using class selectors that the theme files own. Components expose CSS custom properties or predictable class names as styling hooks; themes use those hooks rather than reaching into component internals.

### Positive Consequences

- Design system components are self-contained and portable — a future project imports the component and its module CSS, then layers its own theme
- The admin/client split is explicit and maintainable rather than mixed into a single stylesheet
- CSS Modules scoping prevents style leakage and specificity conflicts between components
- No runtime dependency — CSS Modules are resolved at build time

### Negative Consequences / Trade-offs

- Requires migrating existing LESS styles for design system components to CSS Modules — non-trivial upfront work
- Two theme files to maintain instead of one; changes to a component's styling hooks must be reflected in both themes
- CSS Modules require a build step; the design system cannot be used as plain HTML without a bundler

---

## Pros and Cons of the Options

### Option A: CSS Modules + separate theme files

- ✅ Component styles are portable and colocated
- ✅ Admin/client theme split is explicit
- ✅ Scoped styles prevent conflicts
- 🚫 Migration cost from current LESS setup
- 🚫 Two themes to keep in sync as components evolve

### Option B: Global LESS with namespacing

- ✅ No migration cost — extends the current approach
- ✅ LESS variables and mixins available across all styles
- 🚫 Component styles are not portable — they depend on global LESS variables and imports
- 🚫 Admin/client split would be managed by convention, not structure — easy to break

### Option C: CSS-in-JS

- ✅ Fully portable — styles ship with component JS
- ✅ Dynamic theming via JS context
- 🚫 Not aligned with the project's CSS-first approach
- 🚫 Runtime overhead; adds bundle weight
- 🚫 Harder to override from a consuming app without understanding the runtime API

---

## Links and References

- [ADR-0007: Component Library](./0007-component-library.md) — Radix UI decision and CSS ownership rationale
- [ADR-0013: Storybook Multi-Theme Configuration](./0013-storybook-multi-theme-configuration.md)
