# Renovate Setup

Renovate runs self-hosted via GitHub Actions. See [ADR-0006](../decisions/0006-dependency-update-automation.md) and [issue #46](https://github.com/kad-products/rezept-core/issues/46) for the decision context.

## How it runs

- **Weekly** — Monday at 02:00 UTC (cron in `.github/workflows/renovate.yaml`)
- **On merge to `main`** — catches post-merge state changes immediately
- **Manually** — via the "Run workflow" button in the Actions tab

Renovate opens PRs for outdated dependencies according to `renovate.json`. Non-major devDependency updates are grouped and automerged once CI passes. Drizzle, Cloudflare, and RedwoodSDK packages are grouped but require manual review.

A **Dependency Dashboard** issue is maintained automatically in the repo — it gives an at-a-glance view of pending updates, ignored packages, and upcoming merges.

---

## What Terraform manages

The following settings are managed in `terraform/` and applied via `terraform apply`:

- `github_repository.allow_auto_merge = true` — enables GitHub's native auto-merge feature on PRs
- `github_branch_protection` required status checks — `Unit Tests / unit-tests` is required, so automerge waits for CI to pass before merging
- `github_actions_secret.REZEPT_CORE_WORKFLOW_AUTOMATION` — the secret slot exists in Terraform; value is passed as the `REZEPT_CORE_WORKFLOW_AUTOMATION` variable at apply time

---

## First-time setup

The only step that cannot be automated is creating the PAT itself — it must be generated in the GitHub UI.

### 1. Create a fine-grained PAT

Go to [GitHub → Settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/personal-access-tokens).

- **Token name:** `rezept-core-renovate`
- **Expiration:** 90 days (calendar a reminder to rotate)
- **Resource owner:** `kad-products`
- **Repository access:** Only `kad-products/rezept-core`
- **Repository permissions:**

  | Permission      | Access                        | Reason / Details                         |
  | --------------- | ----------------------------- | ---------------------------------------- |
  | Commit Statuses | Read and write                | Necessary to check on existing PRs       |
  | Contents        | Read and write                | To write code                            |
  | Issues          | Read and write                | Dependency dashboard updates             |
  | Metadata        | Read (required, auto-granted) | Always included                          |
  | Pull requests   | Read and write                | To manage PRs for renovate               |
  | Workflows       | Read and write                | Allow renovate to update action versions |

  > `Workflows` is required because Renovate will open PRs that update files in `.github/workflows/` when GitHub Actions versions change.

### 2. Apply Terraform with the token value

Pass the token as the `REZEPT_CORE_WORKFLOW_AUTOMATION` variable when applying:

```bash
cd terraform
terraform apply -var="REZEPT_CORE_WORKFLOW_AUTOMATION=github_pat_..."
```

This stores the token as the `REZEPT_CORE_WORKFLOW_AUTOMATION` Actions secret, alongside the other repo and branch protection settings.

---

## Rotating the PAT

Every 90 days:

1. Generate a new fine-grained token with the same settings as above
2. Re-run `terraform apply -var="REZEPT_CORE_WORKFLOW_AUTOMATION=github_pat_..."` with the new value
3. Delete the old token from your GitHub profile

---

## Migrating to Mend Cloud (managed)

When ready to stop self-hosting:

1. Install the [Mend Renovate GitHub App](https://github.com/apps/renovate) on the `kad-products` org
2. Delete `.github/workflows/renovate.yaml`
3. Remove `terraform/secrets.tf` (or keep it — Mend Cloud uses a GitHub App, not the PAT)
4. `renovate.json` is picked up automatically by Mend — no changes needed
