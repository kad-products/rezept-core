resource "cloudflare_d1_database" "core_database" {
  account_id = var.account_id
  name = "rezept-core-${var.environment}"
}