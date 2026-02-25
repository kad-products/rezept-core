resource "cloudflare_r2_bucket" "recipe_imports" {
  account_id = var.account_id
  name = "rezept-recipe-imports-${var.environment}"
}