resource "github_branch_protection" "main" {
  repository_id = var.repository_name
  pattern       = "main"

  required_status_checks {
    strict = true
    contexts = [
      "commitlint / commitlint"
    ]
  }

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
    required_approving_review_count = 0
  }

  enforce_admins = false
  allows_deletions    = false
  allows_force_pushes = false

  restrict_pushes {
    blocks_creations = false
    push_allowances = [
      data.github_user.admin.node_id
    ]
  }
}