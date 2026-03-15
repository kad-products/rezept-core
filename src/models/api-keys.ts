import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const apiKeys = sqliteTable(
	'api_keys',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		permissions: text('permissions', { mode: 'json' }).$type<string[]>().notNull().default([]),
		revokeAt: text(),
		apiKey: text()
			.notNull()
			.$defaultFn(() => `rz_std_${crypto.randomBytes(32).toString('hex')}`),
		createdAt: text()
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		createdBy: text()
			.notNull()
			.references(() => users.id),
		updatedAt: text(),
		updatedBy: text().references(() => users.id),
		deletedAt: text(),
		deletedBy: text().references(() => users.id),
	},
	table => [index('api_keys_user_id_idx').on(table.userId)],
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
	user: one(users, {
		fields: [apiKeys.userId],
		references: [users.id],
	}),
}));
