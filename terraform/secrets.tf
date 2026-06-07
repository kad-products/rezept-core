resource "github_actions_secret" "rezept_core_workflow_automation" {
  repository      = "rezept-core"
  secret_name     = "REZEPT_CORE_WORKFLOW_AUTOMATION"
  plaintext_value = var.rezept_core_workflow_automation
}
