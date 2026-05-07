resource "github_actions_secret" "renovate_token" {
  repository      = "rezept-core"
  secret_name     = "RENOVATE_TOKEN"
  plaintext_value = var.renovate_token
}
