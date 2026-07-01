resource "github_repository" "repo" {
  name                   = "rezept-core"
  description            = "Seasonal ingredient and recipes made easy."
  delete_branch_on_merge = true
  allow_auto_merge       = true
  has_discussions        = true
  has_issues             = true
  has_projects           = true

  pages {
    source {
      branch = "gh-pages"
      path   = "/"
    }
    build_type = "legacy"
  }
}