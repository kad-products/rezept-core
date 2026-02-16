import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type * as schema from '@/models';

export type AnyDrizzleDb = DrizzleD1Database<typeof schema> | LibSQLDatabase<typeof schema>;
