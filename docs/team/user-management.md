# User Management

## Roles

All new accounts are created with the **Basic** role. Basic users can create and manage recipes but cannot manage seasons or access admin pages.

The **Admin** role adds:
- Season management (create, edit, delete)
- Access to the admin dashboard (`/admin`)
- Ability to view and edit any user's role

See [`docs/permissions.md`](../permissions.md) and [`docs/roles.md`](../roles.md) for the full permission matrix.

---

## Upgrading a user's role

There is no in-app request mechanism as it won't happen often so just create an [issue in Rezept](https://github.com/kad-products/rezept-core/issues) (use the blank issue option) and include your username so he can find your account.

**To process the request:**

1. Log in with an Admin account and go to **`/admin/users`**
2. Find the user by username
3. Click **Edit** on their row
4. Change the **Role** dropdown to `ADMIN`
5. Click **Save**

The change takes effect immediately on the user's next page load.

---

## Known limitations

| Area                   | Status                                                   |
| ---------------------- | -------------------------------------------------------- |
| Role request flow      | No in-app mechanism — users contact an admin out-of-band |
| Self-service downgrade | Users cannot change their own role                       |
| Role granularity       | Only BASIC and ADMIN exist — no intermediate role        |
