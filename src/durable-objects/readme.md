# Durable Objects

Cloudflare Durable Objects used by the application. Each file implements a single Durable Object class.

## Contents

- **`sessions.ts`** — `SessionDurableObject`: stores and manages user session state (userId, challenge, expiry) as well as defines the `defineDurableSession` instance used by middleware and auth actions to read/write sessions via the Durable Object.. Exported from `worker.tsx` for Cloudflare to bind.

## Guidelines

- **No application logic** — Durable Objects manage state only; business logic belongs in actions or middleware
- **Exported from `worker.tsx`** — Cloudflare requires Durable Object classes to be re-exported from the worker entry point
