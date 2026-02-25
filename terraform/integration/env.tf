module "cloudflare_env" {
  source = "../cloudflare-env"

  environment = "integration"
  account_id = var.account_id
}