output "recipe_uploads_bucket_name" {
  value = cloudflare_r2_bucket.recipe_uploads.name
}

output "core_database_name" {
  value = cloudflare_d1_database.core_database.name
}

output "core_database_id" {
  value = cloudflare_d1_database.core_database.id
}