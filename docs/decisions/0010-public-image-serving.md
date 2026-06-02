# ADR-0010: Serve Images via Worker Route Rather Than Public R2 Bucket

- **Date:** 2026-06-01
- **Status:** Accepted
- **Deciders:** Adam Dehnel

---

## Context and Problem Statement

Recipe cover images are stored in Cloudflare R2. They need to be accessible from recipe pages and embeds. The simplest zero-cost option is to mark the R2 bucket public and serve objects directly from Cloudflare's edge. The alternative is a Worker route (`GET /api/images/:imageId`) that proxies the R2 object — which works but costs a Worker invocation per image request.

The question is whether the cost and complexity of a Worker route is justified when a public bucket would serve the same content for free.

## Decision Drivers

- Cover images are public content — there is no current requirement for per-image access control
- Worker invocation cost is real, even if currently negligible at low volume
- Future features may require private images (user-uploaded photos, personal recipe images)
- Switching from a public bucket to a Worker-fronted route later requires meaningful rework (new bucket configuration, URL migration, cache invalidation)

## Considered Options

- **Option A:** Public R2 bucket — images served directly from Cloudflare edge, no Worker involved
- **Option B:** Worker route — Worker proxies R2 objects, authentication and logic can be added per request

## Decision Outcome

**Option B.** A Worker route was implemented now, even though all images are currently public, because it preserves the option to add per-image access control in the future without a full rearchitecture.

Starting with a public bucket and later needing private images would require standing up a new bucket (or switching to signed URLs), migrating existing image URLs, and invalidating cached public URLs. Starting with a Worker route means access control can be introduced by adding logic to an existing handler — the URL scheme and storage layer stay the same.

The current invocation cost is low enough that it does not justify locking in the simpler approach. If volume grows to the point where image serving costs become meaningful, the Worker route can be swapped for a public bucket at that time with full awareness of the trade-offs (#307).

### Positive Consequences

- Access control (per-user, per-recipe, signed URLs) can be added to the existing handler without changing image URLs or migrating storage
- The same handler can serve different access policies for different image types if needed (e.g. public scraped images, private user uploads)

### Negative Consequences / Trade-offs

- Worker invocation on every image request — cost that a public bucket would not incur
- Additional latency versus direct edge serving, though Cloudflare's network minimises this in practice

---

## Pros and Cons of the Options

### Option A: Public R2 bucket

- ✅ Zero Worker invocation cost — served directly from Cloudflare edge
- ✅ Lower latency
- ✅ No code to maintain
- 🚫 No path to per-image access control without a full migration — new bucket, new URLs, cache invalidation
- 🚫 All images in the bucket are permanently public; private images would require a separate setup

### Option B: Worker route (current)

- ✅ Access control, signed URLs, or per-request logic can be added to the existing handler
- ✅ Public and private image types can coexist under the same URL scheme
- 🚫 Worker invocation cost per image request
- 🚫 Slightly higher latency than direct edge serving
