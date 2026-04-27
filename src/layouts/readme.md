# Layouts

Layouts are page-level wrapper components that provide consistent chrome — navigation, headers, and other structural UI shared across pages. See [project architecture](../../docs/development/project-architecture.md) for where layouts fit relative to other types.

## What they do

Layouts receive page content as `children` and render it inside a consistent shell. They also receive `ctx` to drive permission-aware UI (e.g. which nav items to show).

## Current layouts

- **`StandardLayout`** — the main application shell with navigation. Used by all current pages.

An admin layout is planned for administrative pages.

## Guidelines

- **Default export** — one layout component per file
- **`children` + `ctx`** — layouts accept `children: React.ReactNode` and `ctx` for permission checks
- **No data fetching** — layouts receive everything they need as props; they do not call repositories
- **No `'use client'`** — layouts are server components
