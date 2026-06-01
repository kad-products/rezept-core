import crypto from 'node:crypto';
import { relations, sql } from 'drizzle-orm';
import { type AnySQLiteColumn, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { userRoles } from '@/data/roles';
import { credentials } from './credentials';

export const users = sqliteTable('users', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	username: text().notNull().unique(),
	role: text({ enum: userRoles }).default('BASIC'),
	createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
	createdBy: text().references((): AnySQLiteColumn => users.id),
	updatedAt: text(),
	updatedBy: text().references((): AnySQLiteColumn => users.id),
	deletedAt: text(),
	deletedBy: text().references((): AnySQLiteColumn => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
	credentials: many(credentials),
}));
