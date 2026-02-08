terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  owner = "kad-products"
  # Token via GITHUB_TOKEN env var
}

data "github_user" "admin" {
  username = var.admin_username
}

resource "github_branch_protection" "main" {
  repository_id = var.repository_name
  pattern       = "main"

  required_status_checks {
    strict = true
    contexts = [
      "commitlint"
    ]
  }

  enforce_admins = false
  allows_deletions    = false
  allows_force_pushes = false

  restrict_pushes {
    push_allowances = [
      data.github_user.admin.node_id
    ]
  }
}