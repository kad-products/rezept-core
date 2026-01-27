import crypto from 'crypto';
import { sqliteTable, text, real, index } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { users } from './users';
import { lists } from './lists';
import { ingredients } from './ingredients';
import { recipeIngredientUnits } from './recipe-ingredient-units';

export const listItemStatusEnum = ['NEEDED', 'PURCHASED', 'SKIPPED'] as const;
export type ListItemStatus = typeof listItemStatusEnum[number];

export const listItems = sqliteTable('list_items', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  listId: text()
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),
  ingredientId: text()
    .notNull()
    .references(() => ingredients.id),
  quantity: real(),
  unitId: text().references(() => recipeIngredientUnits.id),
  status: text().$type<ListItemStatus>().notNull().default('NEEDED'),
  notes: text(),
  createdAt: text().notNull().$defaultFn(() => new Date().toISOString()),
  createdBy: text()
    .notNull()
    .references(() => users.id),
  updatedAt: text().$defaultFn(() => new Date().toISOString()),
  updatedBy: text().references(() => users.id),
  deletedAt: text(),
  deletedBy: text().references(() => users.id),
}, (table) => [
  index('list_items_list_id_idx').on(table.listId),
  index('list_items_ingredient_id_idx').on(table.ingredientId),
]);

export const listItemsRelations = relations(listItems, ({ one }) => ({
  list: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
  ingredient: one(ingredients, {
    fields: [listItems.ingredientId],
    references: [ingredients.id],
  }),
  unit: one(recipeIngredientUnits, {
    fields: [listItems.unitId],
    references: [recipeIngredientUnits.id],
  }),
  creator: one(users, {
    fields: [listItems.createdBy],
    references: [users.id],
    relationName: 'listItemCreator',
  }),
}));

export type ListItem = typeof listItems.$inferSelect;
export type ListItemInsert = typeof listItems.$inferInsert;