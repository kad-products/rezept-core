# ADR-0007: Component Library

- **Date:** 2026-05-31
- **Status:** Accepted
- **Deciders:** Adam Dehnel
- **Issue:** [#329 — Design system documentation](https://github.com/kad-products/rezept-core/issues/329)

---

## Context and Problem Statement

Building a recipe management app means a lot of interactive UI: dialogs, selects, form fields, tabs. These primitives all come with non-trivial accessibility requirements — keyboard navigation, focus trapping, ARIA roles, screen reader announcements. The question was whether to build these from scratch, reach for a fully-styled component system, or use a headless primitive library.

## Decision Drivers

- Accessibility has to be correct without investing in deep ARIA expertise
- The app needs its own visual design, not a library's default look
- Strong community and documentation — this is foundational and we don't want to be debugging edge cases in obscure libraries
- Works well with a custom CSS approach (no Tailwind dependency, no CSS-in-JS)

## Considered Options

- **Option A:** Radix UI (headless primitives)
- **Option B:** shadcn/ui (pre-styled Radix components, copy-paste model)
- **Option C:** MUI (Material Design, fully styled)
- **Option D:** Roll our own

## Decision Outcome

**Option A — Radix UI.**

Radix UI provides the primitive behavior (focus trapping, keyboard navigation, ARIA attributes, pointer events) without owning the styles. We own the CSS. The `@radix-ui/colors` palette is also used as the token source for the 12-step accent and gray scales.

In practice we have already starting using Radix for `Dialog`, `Form`, and `Select`, plus `@radix-ui/react-icons` for iconography. We import from the `radix-ui` umbrella package rather than individual `@radix-ui/react-*` packages.

### Positive Consequences

- Accessibility is handled by a well-maintained library with a strong track record — keyboard navigation, focus trapping, ARIA roles, and screen reader support come for free
- No design constraints imposed on us — every visual decision is ours
- `@radix-ui/colors` gives us a perceptually-balanced 12-step color scale with light/dark variants and P3 wide-gamut support, which would be tedious to hand-roll

### Negative Consequences / Trade-offs

- Radix is headless — there's no free styling. Every component we use requires CSS work before it looks like anything
- The styling burden grows as we adopt more primitives (each new Radix component needs its own LESS file)
- We're making a bet on Radix's continued maintenance; if it stalls, migrating off would be a meaningful undertaking

---

## Pros and Cons of the Options

### Option A: Radix UI

- ✅ Accessibility built in and well-tested
- ✅ Completely unstyled — full visual control
- ✅ Strong community, actively maintained, excellent docs
- ✅ `@radix-ui/colors` fits naturally with CSS custom property tokens
- 🚫 No free styling — every component needs CSS work
- 🚫 API can be verbose compared to drop-in styled libraries

### Option B: shadcn/ui

Shadcn/ui is a collection of pre-styled Radix components delivered as copy-paste source files. It requires Tailwind CSS and uses Tailwind for all styling.

- ✅ Accessible (built on Radix)
- ✅ Pre-styled and looks good out of the box
- 🚫 Requires Tailwind — we're not using it and don't want to introduce it
- 🚫 Copy-paste model means styles live inside the component files, not in our CSS layer — harder to maintain consistency with the rest of the design system

### Option C: MUI

Fully-styled Material Design component library with a theme system.

- ✅ Huge ecosystem, comprehensive component set
- ✅ Built-in theming
- 🚫 Heavy visual opinions — fighting the default Material look to match our own design takes more effort than starting from scratch
- 🚫 CSS-in-JS runtime adds bundle size and complexity
- 🚫 Material design language may not fit the product direction

### Option D: Roll our own

Build the primitives we need (dialog, select, form fields) from scratch.

- ✅ Complete control
- 🚫 Accessibility is genuinely hard — focus trapping, keyboard nav, ARIA patterns, and screen reader testing are all on us
- 🚫 Significant ongoing maintenance as browser behavior evolves

---

## Links and References

- [Radix UI docs](https://www.radix-ui.com/)
- [Radix Colors](https://www.radix-ui.com/colors)
- [ADR-0001: Form Management Library](./0001-form-management-library.md) — Mantine was also considered and dismissed there
