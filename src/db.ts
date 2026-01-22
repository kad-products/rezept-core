import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "./models/schema";

export default drizzle(env.rezept_core, {
    schema,
    casing: 'snake_case'
});