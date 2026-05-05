# Authentication

## Overview

Rezept uses **passkey-only authentication** — no passwords. Passkeys are a W3C/FIDO2 standard (WebAuthn) implemented here via the [SimpleWebAuthn](https://simplewebauthn.dev) library. The app does not support email/password or OAuth login at this time.

Passkey authentication is a two-party cryptographic exchange: the server issues a random challenge, the device signs it with a private key stored on the device, and the server verifies the signature against the stored public key. No secret is ever transmitted.

---

## Registration flow

Registration creates both the user account and the first passkey credential in one flow.

**Steps:**
1. User enters a username and clicks Register.
2. The server generates a WebAuthn registration challenge and stores it temporarily in the session.
3. The browser prompts the user for biometric/PIN confirmation.
4. The device generates a key pair; the private key stays on the device, the public key + credential metadata is sent to the server.
5. The server verifies the response against the stored challenge.
6. A new user record and credential record are created. The session challenge is cleared.

**Username** is a freeform label stored on the user record — currently only used for display, not for lookup during login (login is credential-based, not username-based).

**Credential naming** is automatic: the server parses the User-Agent header at registration time and constructs a name from device, OS, and browser (e.g. `iPhone | iOS 18.0 | Safari 18.0`). This appears in the credential record. Relevant code: `src/actions/registration.ts` → `deviceNameFromUA`.

**Resident keys are required** (`residentKey: 'required'`), which means the credential is stored on-device and the user doesn't need to identify themselves before authenticating — the device presents available credentials automatically.

---

## Login flow

**Steps:**
1. User clicks Login with passkey.
2. The server generates a WebAuthn authentication challenge and stores it in the session.
3. The browser prompts the user to select a credential and confirm with biometric/PIN.
4. The device signs the challenge; the signed response is sent to the server.
5. The server looks up the credential by ID, verifies the signature, and updates the credential counter.
6. A session is established with the user's ID. The session challenge is cleared.

If the user has no stored credentials for this site on the current device, the browser will indicate it can't find a passkey — this is the browser's native UI, not an app error.

---

## Sessions

Sessions are stored in **Cloudflare Durable Objects** — not in the database. The browser receives a session cookie containing only an identifier; the actual session state (user ID, challenge, timestamps) lives server-side.

**Session lifetime:** 14 days, sliding. Every request that reads the session updates `lastAccessedAt`. A session expires if it hasn't been accessed in 14 days. On expiry the server clears the session and redirects to `/auth/login`.

**Session contents:**
| Field | Description |
|---|---|
| `userId` | ID of the authenticated user; `null` during an in-progress registration/login challenge |
| `challenge` | Temporary WebAuthn challenge string; `null` when no auth flow is in progress |
| `createdAt` | Timestamp when the session was first created |
| `lastAccessedAt` | Updated on every read; used to enforce the 14-day window |

**Logout** (`/auth/logout`) calls `sessions.remove()` which deletes the Durable Object state and clears the session cookie. The user is redirected to `/`.

---

## Protected routes and access control

Two interrupters gate access:

**`requireAuthentication`** — throws a 401 error if `ctx.user` is null (no active session with a valid user). Used on any route or action that requires a logged-in user.

**`requirePermissions(...permissions)`** — throws a 403 error if the user lacks one or more of the required permissions. Always used after `requireAuthentication` since it assumes a user is present.

**What the user sees** when hitting a protected page without being logged in: currently the app renders an in-page error component (HTTP 200 response with an error UI) rather than redirecting to login. This is a known UX gap being tracked in [issue #127](https://github.com/kad-products/rezept-core/issues/127) — the redirect-vs-interstitial behavior isn't finalized yet.

**API routes** return a JSON error response (401 or 403) to unauthenticated/unauthorized callers — appropriate for programmatic access.

---

## Permissions

Permissions are a separate layer on top of authentication. A user can be authenticated (logged in) but still be denied access to specific features based on their assigned permissions. Permissions are stored on the user record and checked by `requirePermissions`.

See [`docs/permissions.md`](../permissions.md) and [`docs/roles.md`](../roles.md) for the full permission and role definitions.

---

## Current limitations and known gaps

| Area | Status |
|---|---|
| Account recovery | Not implemented — if a user loses all devices with their passkey and has no synced keychain, they cannot log in. Tracking: no open issue yet. |
| Multiple credentials per user | The data model supports it (`credentials` table allows many per user) but there is no UI to register a second device without creating a new account. |
| Auth failure UX on page routes | Currently shows an in-page error component rather than redirecting to login. See [#127](https://github.com/kad-products/rezept-core/issues/127). |
| Auth middleware refactor | The session/user middleware and interrupter patterns are being reviewed. See [#123](https://github.com/kad-products/rezept-core/issues/123). |
| Login page polish | The login page currently renders raw JSON debug output (`ctx`, session) below the login form. This is development scaffolding, not a finished UI. |
| Username management | Users cannot change their username after registration. |

---

## Where to extend

- **Adding a second passkey / device management UI**: The `credentials` table and `createCredential` repository already support multiple credentials per user. The missing piece is a UI that lets a logged-in user initiate a second registration flow without creating a new account.
- **Social/OAuth login**: Would require a new auth provider integration and a way to link an OAuth identity to an existing user record.
- **Password login**: Possible to add alongside passkeys but intentionally not included — passkeys are more secure and the UX is comparable for most users.
- **Session duration configurability**: Currently hardcoded to 14 days via `MAX_SESSION_DURATION` in rwsdk. Making this configurable per-user or per-role is possible but not planned.
