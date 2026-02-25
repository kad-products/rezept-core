output "recipe_imports_bucket_name" {
  value = cloudflare_r2_bucket.recipe_imports.name
}

output "core_database_name" {
  value = cloudflare_d1_database.core_database.name
}

output "core_database_id" {
  value = cloudflare_d1_database.core_database.id
}