import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { listItems } from './list-items';
import { users } from './users';

export const lists = sqliteTable(
	'lists',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text().notNull(),
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
	table => [index('lists_user_id_idx').on(table.userId)],
);

export const listsRelations = relations(lists, ({ one, many }) => ({
	user: one(users, {
		fields: [lists.userId],
		references: [users.id],
		relationName: 'listOwner',
	}),
	items: many(listItems),
	creator: one(users, {
		fields: [lists.createdBy],
		references: [users.id],
		relationName: 'listCreator',
	}),
}));
