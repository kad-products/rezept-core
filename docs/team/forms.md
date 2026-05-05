# Forms

## Overview

All data entry in Rezept uses a consistent form system built on two libraries working together:

- **TanStack Form** — manages field state, validation, and submission
- **Radix UI Form** — provides the accessible structure (labels wired to inputs, ARIA attributes, error message markup)

Neither is visible to users as a named thing — they just experience the form behavior. The split exists because each library does one job well and they complement each other cleanly.

## Available input types

The following input types are currently implemented and available for use across the app:

| Input | Used for |
|---|---|
| Text | Single-line text (names, titles, URLs) |
| Textarea | Multi-line text (descriptions, instructions) |
| Number | Numeric values (servings, cook time) |
| Select | Single-choice dropdowns |
| Checkbox group | Multi-select (permissions) |
| Submit button | Form submission with loading state |

File inputs are handled separately — see [File uploads](#file-uploads) below.

## Validation

Forms currently validate **on blur** — when a user leaves a field (tabs away or clicks elsewhere), that field is checked against the schema. Errors appear inline below the field.

Validation also runs **server-side** when the form is submitted, using the same Zod schema. This means even if client-side validation is bypassed, the server will reject invalid data. Server-level errors (e.g. a database failure) surface as a form-level message rather than a field-level one.

### Current UX concern

On-blur validation has a known UX rough edge: a user filling out a form top-to-bottom may see errors appear on earlier fields as they move forward, before they've had a chance to complete and review the whole form. This can feel jarring, especially on longer forms like the recipe form.

This behavior is under active review ([#126](https://github.com/kad-products/rezept-core/issues/126)) — the team hasn't settled on the right trigger (on blur, on submit, or hybrid). The current behavior should be considered provisional.

## Submission and feedback

When a form is submitted:

1. Client-side validation runs first. If it fails, no request is made to the server.
2. If validation passes, the server action is called.
3. The server validates again, then attempts to save.
4. The form displays either a success message or an error.

Currently success and error states are simple inline text messages. More polished feedback (toast notifications, redirects, etc.) is not yet implemented.

## File uploads

File uploads are handled outside the standard form system. The current recipe import upload submits directly to an API endpoint, which streams the file to R2 storage. It does not go through TanStack Form and has no shared component.

If more file upload features are added, centralising this into a reusable component (with progress state, error handling, and consistent UX) is worth prioritising. No plan for that exists yet.

## Known gaps and open questions

| Area | Status |
|---|---|
| Validation timing | On-blur behavior under review — see [#126](https://github.com/kad-products/rezept-core/issues/126) |
| Success UX | Currently plain text; no redirects or toast notifications |
| File upload | No shared component; handled ad-hoc per upload surface |
| Select and Textarea accessibility | Not yet fully aligned with the Radix Form pattern used by other inputs |
