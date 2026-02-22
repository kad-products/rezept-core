# ADR-NNNN: [Short Title of Decision]

- **Date:** 2026-02-17
- **Status:** Accepted
- **Deciders:** Adam Dehnel

---

## Context and Problem Statement

Starting off with our own basic form management of our own design got to be too much pretty quickly. Before getting into any real development, it seemed like a good plan to have a legitimate library in place.

## Decision Drivers

- Needed something relatively quickly so as to not get bogged down in minutiae of library preferences and options
- Good docs
- Reasonably large community
- Fits well with RSC and RWSDK

## Considered Options

- Option A: TanStack Form
- Option B: React Hook Forms
- Option C: Mantine Form

## Decision Outcome

Really they all seemed like they could do the job so it came down to just kind of an overall feel. Mantine was clearly the least mature and least used so that got cut once it was clear that it didn't have any significant advantages with its UI components which are also being considered for this project so then it came down to docs and his ability, and TanStack just seemed better.

### Positive Consequences

- the biggest one is that I can start using it and stop writing boiler plate code as much
- the form context and composition model that's on their docs site is intriguing and seems to fit well with where I'd like to see this going

### Negative Consequences / Trade-offs

- for sure, the biggest drawback and negative against TanStack is that it is newer and less well used by the community. Their docs have a good structure to them, but are lacking in their completeness. 

---

## Pros and Cons of the Options

### Option A: TanStack Form

Newcomer to the space that feels just like that: a newcomer. Run by a well established library creator makes me think it'll be good. Also heard good things in the Redwood discord.

- 🔗 Site: https://tanstack.com/form/latest
- ✅ Pros:
    - Everything explicit (no magic)
    - Inline array handling (no extra hooks)
    - Per-field validation control
    - Framework agnostic (if you ever need it)
    - Modern API design
- 🚫 Cons
    - More verbose for simple cases
    - Nested arrays get deeply indented
    - Manual key management for arrays
    - Smaller ecosystem

### Option B: React Hook Form

- 🔗 Site: https://react-hook-form.com/
- ✅ Pros:
     - Works well with Zod (server-side validation library)
     - Well established and heavily used
     - Covers all our functional needs
     - Less boilerplate
- 🚫 Cons:
     - Less explicit (magic spread)
     - Harder to customize per-field validation
     - Separate hooks for arrays

### Option C: Mantine Form

- 🔗 Site: https://mantine.dev/form/package/
- ✅ Pros:
    - Works with Zod (server-side validation library)
    - Could be nice if we use mantine UI components too
- 🚫 Cons:
    - Baked into UI library so limited options
    - Less mature and well used

---

## Links and References

- [Evaluation issue](https://github.com/kad-products/rezept-core/issues/3)