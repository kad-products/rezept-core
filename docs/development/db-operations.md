# Database Operations

## Entity Changes / Migrations

1. Make the changes to the `/src/models/*` files
2. `pnpm db:migrate:new` to make the SQL migration files (and other meta files) in `/drizzle`
3. `pnpm db:migrate:dev` to apply those to the local DB