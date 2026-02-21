resource "github_repository" "repo" {
  name        = var.repository_name
  delete_branch_on_merge = true
  description                             = "Initial core RSC app using RedwoodSDK"
  has_discussions                         = true
  has_issues                              = true
  has_projects                            = true
}