import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/models",
  out: "drizzle",
  dialect: "sqlite",
  casing: 'snake_case',
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/5cd4690a3ebd411ce7bf9d0fc46e2595bb794d77377c2e21c6406975507964d6.sqlite",
  },
});