import { createTestDb } from '../setup';

type TestableDB = Awaited<ReturnType<typeof createTestDb>>;
let db: TestableDB = {} as TestableDB;

export async function resetDb() {
	db = await createTestDb();
}

export default new Proxy({} as TestableDB, {
	get(_, prop) {
		// biome-ignore lint/suspicious/noExplicitAny: the export is typed, this is just the proxy and it is just for tests
		return (db as any)[prop];
	},
}) as TestableDB;
