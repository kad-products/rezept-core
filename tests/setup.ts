import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '@/models';

// Use a temp file instead of :memory: so that db.transaction() — which internally
// nulls out the client's connection and lazily re-opens it — reconnects to the same
// database rather than a fresh empty :memory: instance.
//
// Why not :memory:? The libsql sqlite3 client sets `this.#db = null` after calling
// transaction(), then lazily calls `new Database(this.#path)` on the next query. For
// :memory: that creates a brand new empty database. For a file path it reopens the
// same file, so the migrated schema is still there.

let currentDbFile: string | null = null;

export async function createTestDb() {
	if (currentDbFile) {
		await unlink(currentDbFile).catch(() => {});
		currentDbFile = null;
	}

	const dbFile = join(tmpdir(), `rezept-test-${process.pid}-${Date.now()}.db`);
	currentDbFile = dbFile;

	const client = createClient({ url: `file:${dbFile}` });
	const db = drizzle(client, { schema, casing: 'snake_case' });

	await migrate(db, { migrationsFolder: './drizzle' });

	return db;
}
