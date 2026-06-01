resource "github_repository_environment" "integration" {
  environment = "integration"
  repository  = github_repository.repo.name

  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
}

resource "github_repository_environment" "staging" {
  environment = "staging"
  repository  = github_repository.repo.name

  reviewers {
    users = [data.github_user.admin.id]
  }

  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
}

resource "github_repository_environment" "production" {
  environment = "production"
  repository  = github_repository.repo.name

  reviewers {
    users = [data.github_user.admin.id]
  }

  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
}
