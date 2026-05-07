variable "renovate_token" {
  description = "Fine-grained PAT used by the self-hosted Renovate workflow to open and automerge dependency PRs. See docs/development/renovate-setup.md."
  type        = string
  sensitive   = true
}