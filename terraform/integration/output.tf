output "wrangler_env" {
  value = jsonencode({
    workers_dev = true
	durable_objects = {
        bindings = [
            {
                name = "SESSION_DURABLE_OBJECT"
                class_name = "SessionDurableObject"
            }
        ]
    }
    d1_databases = [
        {
            binding = "rezept_core"
            database_name = module.cloudflare_env.core_database_name
            database_id = module.cloudflare_env.core_database_id
            migrations_dir = "drizzle"
        }
    ]
    r2_buckets = [
        {
            binding = "rezept_recipe_imports"
            bucket_name = module.cloudflare_env.recipe_imports_bucket_name
        }
    ]
  })
}