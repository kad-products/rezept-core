import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './models';

export default drizzle(env.rezept_core, {
	schema,
	casing: 'snake_case',
});
