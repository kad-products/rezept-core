import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './models';

export default drizzle(env.REZEPT_CORE, {
	schema,
	casing: 'snake_case',
});
