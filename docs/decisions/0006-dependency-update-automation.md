# ADR-0006: Automated Dependency Updates with Renovate

- **Date:** 2026-05-05
- **Status:** Accepted
- **Deciders:** Adam Dehnel
- **Issue:** [#46 — Renovate/dependabot setup](https://github.com/kad-products/rezept-core/issues/46)

---

## Context and Problem Statement

Dependency updates are currently manual. This means security patches can go unnoticed, peer dependency ranges drift, and keeping the stack current requires deliberate effort that competes with feature work. A small team needs this automated.

## Decision Drivers

- Free or near-zero cost to start, with a clear path to a managed solution once revenue allows
- pnpm 10 lockfile support
- Works with the existing GitHub Actions CI pipeline
- Controllable PR volume — weekly batching, not a flood on every release
- Automerge for low-risk updates (patch/minor devDependencies) gated on CI passing
- Prior team familiarity with Renovate

## Considered Options

- **Option A:** Renovate, self-hosted on GitHub Actions
- **Option B:** Renovate, Mend Cloud managed (free tier)
- **Option C:** Dependabot (GitHub-native)

## Decision Outcome

**Option A — Renovate, self-hosted on GitHub Actions.**

Self-hosted via the official `renovatebot/github-action` GitHub Action, triggered on a weekly cron and on push to `main`. Config lives in `renovate.json` at the repo root.

When the project has revenue to offset tooling costs, migrate to Mend Cloud (Option B): install the GitHub App, delete the workflow file, and the `renovate.json` config carries over unchanged.

### Positive Consequences

- No external account or third-party access to the repo required right now
- GitHub Actions minutes usage is negligible (~2–3 min/week + a few per `main` merge)
- Full Renovate feature set: grouping, scheduling, automerge, dependency dashboard
- Migration to managed is one GitHub App install and a workflow file deletion

### Negative Consequences / Trade-offs

- A fine-grained PAT must be created, stored as a secret, and rotated manually
- Self-hosted means Renovate won't react to new releases in real time — it only runs on the schedule (weekly) and on push to `main`
- No Merge Confidence scoring (a paid Mend Cloud feature)

---

## Pros and Cons of the Options

### Option A: Renovate, self-hosted on GitHub Actions

- ✅ Completely free within GitHub Actions free-tier minutes
- ✅ Full Renovate config capability
- ✅ pnpm 10 support is first-class
- ✅ Config is portable — no migration cost if moving to managed later
- 🚫 PAT management is manual overhead
- 🚫 Runs on schedule only, not on new release events

### Option B: Renovate, Mend Cloud managed

- ✅ No workflow file or PAT to maintain
- ✅ Reacts to new releases in near real-time
- ✅ Merge Confidence scoring available (paid)
- 🚫 Requires granting a third-party GitHub App access to the repo
- 🚫 Free tier limits and future pricing are subject to Mend's discretion

### Option C: Dependabot

- ✅ Zero setup — a single `.github/dependabot.yml` file, no external account
- ✅ GitHub-native, no token required
- 🚫 Less flexible grouping and scheduling than Renovate
- 🚫 Automerge requires additional GitHub Actions wiring
- 🚫 Fewer knobs for PR noise control

---

## Migration to Mend Cloud

When ready:

1. Install the [Mend Renovate GitHub App](https://github.com/apps/renovate) on the `kad-products` org
2. Delete `.github/workflows/renovate.yaml`
3. Remove `terraform/secrets.tf` (or keep it — Mend Cloud uses a GitHub App, not the PAT)
4. The `renovate.json` config is read directly by Mend — no changes needed

See `docs/development/renovate-setup.md` for the self-hosted setup steps.
