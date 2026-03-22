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
- Saved as `SEMANTIC_RELEASE_TOKEN` in [GitHub Secrets](https://github.com/kad-products/rezept-core/settings/secrets/actions)