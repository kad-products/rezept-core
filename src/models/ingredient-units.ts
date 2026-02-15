import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { recipeIngredients } from './recipe-ingredients';
import { users } from './users';

export const ingredientUnits = sqliteTable('ingredient_units', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text().notNull(),
	abbreviation: text().notNull(),
	type: text().notNull(), // volume, weight, count, etc.
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	createdBy: text()
		.notNull()
		.references(() => users.id),
	updatedAt: text().$defaultFn(() => new Date().toISOString()),
	updatedBy: text().references(() => users.id),
	deletedAt: text(),
	deletedBy: text().references(() => users.id),
});

export const ingredientUnitsRelations = relations(ingredientUnits, ({ many, one }) => ({
	recipeIngredients: many(recipeIngredients),
	creator: one(users, {
		fields: [ingredientUnits.createdBy],
		references: [users.id],
		relationName: 'unitCreator',
	}),
}));
