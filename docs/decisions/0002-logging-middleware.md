# ADR-0002: Logging Middleware

- **Date:** 2026-02-22
- **Status:** Accepted
- **Deciders:** Adam Dehnel

---

## Context and Problem Statement

Logging is alright now while this is local but before getting into a deployed runtime we need some JSON formatting and middleware context.  Need something simple and lightweight.

## Decision Drivers

- Basic logging of requests will help troubleshooting remote calls

## Considered Options

- Option A: Pino
- Option B: Home-rolled
- Option C: Winston

## Decision Outcome

Tried the standard libraries and they both have dependencies on writing to a filesystem.  Perhaps I could work around that but felt like they were more than I needed anyway.  Figured I could do a middleware myself quick and if it needs more work I can check another logger or more advanced setup in the future.

### Positive Consequences

- having something is better than nothing
- unblocks the move to an integration deployment

### Negative Consequences / Trade-offs

- this is more code to maintain and not a super rich tooling setup
- likely this causes more tech debt in the future but sort of just willing to accept that

---

## Pros and Cons of the Options

### Option A: Pino

Seems lightweight and useable but haven't used it before and it had a dependency on the local filesystem.

### Option B: Home-rolled

Extra work and code to maintain but gets me unstuck.  Likely will have extra problems to handle and will deal with that in due time.

### Option C: Winston

Honestly didn't actually try it.  After Pino I researched a little bit about CloudFlare Worker Logging and didn't find much so I just disregarded this to get myself unstuck.

---

## Links and References

- [Original work issue](https://github.com/kad-products/rezept-core/issues/7)