import crypto from 'node:crypto';
import { relations, sql } from 'drizzle-orm';
import { blob, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const credentials = sqliteTable(
	'credentials',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
		updatedAt: text().$defaultFn(() => new Date().toISOString()),
		credentialId: text().notNull().unique(),
		publicKey: blob().$type<Uint8Array>().notNull(),
		counter: integer().notNull().default(0),
		name: text(),
		lastUsedAt: text(),
	},
	table => [
		index('credentials_user_id_idx').on(table.userId),
		index('credentials_credential_id_idx').on(table.credentialId),
		index('credentials_user_credential_idx').on(table.userId, table.credentialId),
	],
);

export const credentialsRelations = relations(credentials, ({ one }) => ({
	user: one(users, {
		fields: [credentials.userId],
		references: [users.id],
	}),
}));
