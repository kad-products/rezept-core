resource "cloudflare_r2_bucket" "recipe_uploads" {
  account_id = var.account_id
  name = "rezept-recipe-uploads-${var.environment}"
}