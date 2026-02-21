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