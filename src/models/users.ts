import crypto from 'node:crypto';
import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { credentials } from './credentials';

export const users = sqliteTable('users', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	username: text().notNull().unique(),
	createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
	updatedAt: text().$defaultFn(() => new Date().toISOString()),
});

export const usersRelations = relations(users, ({ many }) => ({
	credentials: many(credentials),
}));
