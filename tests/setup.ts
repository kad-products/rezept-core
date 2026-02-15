import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '@/models';

export async function createTestDb() {
	const client = createClient({
		url: ':memory:', // In-memory database
	});
	const db = drizzle(client, { schema, casing: 'snake_case' });

	// Run your Drizzle migrations
	await migrate(db, { migrationsFolder: './drizzle' });

	return db;
}
