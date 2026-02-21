# Security Considerations

## Authentication

- Passkey-based auth via `rwsdk`
- Session stored in HTTP-only cookies
- Middleware enforces auth on protected routes

## Input Validation

- Always validate with Zod schemas
- Never trust client data
- Sanitize before database operations (Drizzle handles this)

## Database Access

- All queries parameterized (Drizzle prevents SQL injection)
- User ID from session, never from client input
- Audit fields (createdBy, updatedBy) set server-side
