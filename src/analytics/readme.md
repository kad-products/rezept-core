# Analytics

See [project architecture](../../docs/development/project-architecture.md) for where analytics fits relative to other types.

## What they do

Analytics helpers are thin, fire-and-forget wrappers around Cloudflare Analytics Engine (AE). Each helper accepts a typed data point, converts it to AE's `{ indexes, blobs, doubles }` structure, and calls `writeDataPoint`. The caller does not await a result.

AE data is queryable via the [CF Analytics Engine SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/).

## When to add a tracker

Add a tracker when you need to count or analyse discrete events over time (logins, API key usage, etc.) that are not already covered by Cloudflare's built-in Workers observability.

Do not add trackers for debugging — use the logger for that. Trackers record business events; the logger records execution context.

## Data contract

Cloudflare Analytics Engine data points have three field types:

| Field | CF type | Used for |
|---|---|---|
| `indexes` | `string[]` | The primary dimension to group or filter by — typically `userId` or `'unknown'` |
| `blobs` | `string[]` | Categorical or text values (type, stage, status, path, method) |
| `doubles` | `number[]` | Numeric measures (counts, durations, sizes) — not used yet |

**Important:** AE has no native boolean type. Serialise booleans to `'true'` / `'false'` strings so they can be filtered in SQL queries:

```ts
// blob3 = 'true' / blob3 = 'false' in SQL
blobs: [..., dataPoint.success.toString()]
```

The blob order within a tracker is its schema — treat it as stable. Changing blob positions is a breaking change for existing queries.

## Guidelines

- **Named exports** — re-exported from `index.ts` so consumers import from `@/analytics`
- **Types stay inline** — AED data point types (`AEDLoginAttemptDataPoint`, etc.) are defined in the same file as their helper; they are not shared across helpers and do not belong in `src/types`
- **Fire-and-forget** — helpers are `void`; callers do not await them and do not catch errors from them
- **One file per dataset** — each AE dataset binding has its own file (e.g. `login-attempt.ts` → `AED_LOGIN_ATTEMPTS`)
- **Naming convention** — files named after the event noun (`login-attempt.ts`), functions prefixed `track` (`trackLoginAttempt`)
