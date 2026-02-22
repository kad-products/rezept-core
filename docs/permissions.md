# Permissions — UX & QA Guide

## What Are Permissions?

Permissions control what actions a user can take in Rezept. Every action in the app — creating a recipe, editing a season, deleting content — is tied to a permission. Users only see and can use features their role allows.

---

## Roles

Every user in Rezept has one of the following roles:

| Role | Description |
|------|-------------|
| `ADMIN` | Full access to everything |
| `BASIC` | Can create and edit recipes, read-only on seasons |
| *(no role / public)* | Read-only access to public content |

---

## How Permissions Are Assigned

Permissions follow a `resource:action` format, for example `recipes:create` or `seasons:delete`. Each permission is granted to one or more roles. Here's the current breakdown:

| Permission | ADMIN | BASIC | Public |
|---|---|---|---|
| `seasons:create` | ✅ | ❌ | ❌ |
| `seasons:read` | ✅ | ✅ | ✅ |
| `seasons:update` | ✅ | ❌ | ❌ |
| `seasons:delete` | ✅ | ❌ | ❌ |
| `recipes:create` | ✅ | ✅ | ❌ |
| `recipes:read` | ✅ | ✅ | ✅ |
| `recipes:update` | ✅ | ✅ | ❌ |
| `recipes:delete` | ✅ | ✅ | ❌ |

---

## What This Means for UX

Buttons, links, and forms are only shown to users who have the relevant permission. For example:

- A `BASIC` user visiting the Seasons section will see seasons but will not see a button to create or delete one.
- An `ADMIN` user will see all controls everywhere.
- A logged-out user can browse read-only content but cannot take any actions.

When designing flows, assume that unauthorized controls are simply not visible — users won't encounter a "you don't have permission" message during normal use because the UI won't offer them the option in the first place.

---

## What This Means for QA

When testing permission-related behavior, you'll want to test each role separately. Key things to verify:

**As a `BASIC` user:**
- Create, edit, and delete recipe actions should be available and functional
- Season create, edit, and delete controls should not be visible
- Attempting to access a season edit URL directly should be handled gracefully

**As an `ADMIN` user:**
- All controls across all resources should be visible and functional

**As a logged-out user:**
- No create, edit, or delete controls should be visible anywhere
- Read-only content should still be accessible

**General:**
- A user should never see a permission error during normal use — if they do, that's a bug worth flagging
- If a control is visible but produces an error when used, that's also a bug — visibility and enforcement should always be in sync

---

## Requesting Permission Changes

If a UX or product decision requires changing who can access something — for example, giving `BASIC` users the ability to manage seasons — that's a one-line change in the codebase. Raise it with the dev team and describe which role should get which permission.