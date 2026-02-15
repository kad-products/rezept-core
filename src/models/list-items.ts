import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ingredientUnits } from './ingredient-units';
import { ingredients } from './ingredients';
import { lists } from './lists';
import { users } from './users';

export const listItemStatusEnum = ['NEEDED', 'PURCHASED', 'SKIPPED'] as const;
export type ListItemStatus = (typeof listItemStatusEnum)[number];

export const listItems = sqliteTable(
	'list_items',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		listId: text()
			.notNull()
			.references(() => lists.id, { onDelete: 'cascade' }),
		ingredientId: text()
			.notNull()
			.references(() => ingredients.id),
		quantity: real(),
		unitId: text().references(() => ingredientUnits.id),
		status: text().$type<ListItemStatus>().notNull().default('NEEDED'),
		notes: text(),
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
	table => [index('list_items_list_id_idx').on(table.listId), index('list_items_ingredient_id_idx').on(table.ingredientId)],
);

export const listItemsRelations = relations(listItems, ({ one }) => ({
	list: one(lists, {
		fields: [listItems.listId],
		references: [lists.id],
	}),
	ingredient: one(ingredients, {
		fields: [listItems.ingredientId],
		references: [ingredients.id],
	}),
	unit: one(ingredientUnits, {
		fields: [listItems.unitId],
		references: [ingredientUnits.id],
	}),
	creator: one(users, {
		fields: [listItems.createdBy],
		references: [users.id],
		relationName: 'listItemCreator',
	}),
}));
