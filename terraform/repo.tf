resource "github_repository" "repo" {
  name                   = "rezept-core"
  description            = "Initial core RSC app using RedwoodSDK"
  delete_branch_on_merge = true
  allow_auto_merge       = true
  has_discussions        = true
  has_issues             = true
  has_projects           = true
}