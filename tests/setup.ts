import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '@/models';

export async function createTestDb() {
	const client = createClient({ url: ':memory:' });
	const db = drizzle(client, { schema, casing: 'snake_case' });
	await migrate(db, { migrationsFolder: './drizzle' });
	return db;
}
