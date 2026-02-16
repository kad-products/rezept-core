import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { recipeIngredients } from './recipe-ingredients';
import { users } from './users';

export const ingredients = sqliteTable('ingredients', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text().notNull().unique(),
	description: text(),
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
});

export const ingredientsRelations = relations(ingredients, ({ many, one }) => ({
	recipeIngredients: many(recipeIngredients),
	creator: one(users, {
		fields: [ingredients.createdBy],
		references: [users.id],
		relationName: 'ingredientCreator',
	}),
}));
