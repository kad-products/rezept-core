## Terraform Token (local dev)

Used when running `terraform apply` locally against the GitHub provider. Not stored as a repo secret — set as `GITHUB_TOKEN` in your shell before running Terraform.

```bash
export GITHUB_TOKEN=github_pat_...
cd terraform && terraform apply
```

- Issued under Adam's profile as [fine-grained token](https://github.com/settings/personal-access-tokens)
- Named `rezept-core-terraform`
- Resource owner: `kad-products`
- Repository access: Only `kad-products/rezept-core`
- No org permissions
- Repository permissions:
  - Read/write `administration` — repo settings (`allow_auto_merge`, etc.) and branch protection rules
  - Read/write `secrets` — Actions secrets (`REZEPT_CORE_WORKFLOW_AUTOMATION`, etc.)
  - Read `metadata` (required, auto-granted)
- Rotate 90 days

---

## GitHub Token

- Issued under Adam's profile as [fine-grained token](https://github.com/settings/personal-access-tokens)
- Named `rezept-core-release-token`
- Resource owner set to `kad-products` organization
- Scoped to `kad-products/rezept-core ` repo
- No org permissions
- Repository permissions:
  - Read/write `contents` permission (aka "code")
  - Read/write `administration` permission to allow for branch protection manipulation
  - Read permission on `metadata`
- Rotate 90 days
- Saved as `REZEPT_CORE_WORKFLOW_AUTOMATION` in [GitHub Secrets](https://github.com/kad-products/rezept-core/settings/secrets/actions)