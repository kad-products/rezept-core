import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ingredientUnits } from './ingredient-units';
import { ingredients } from './ingredients';
import { recipeSections } from './recipe-sections';
import { users } from './users';

export const recipeIngredients = sqliteTable(
	'recipe_ingredients',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		recipeSectionId: text()
			.notNull()
			.references(() => recipeSections.id, { onDelete: 'cascade' }),
		ingredientId: text()
			.notNull()
			.references(() => ingredients.id),
		quantity: real(), // nullable for "to taste"
		unitId: text().references(() => ingredientUnits.id),
		preparation: text(), // chopped, diced, etc.
		modifier: text(), // optional, substitute, etc.
		order: integer().notNull(),
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
	},
	table => [
		index('recipe_ingredients_section_id_idx').on(table.recipeSectionId),
		index('recipe_ingredients_ingredient_id_idx').on(table.ingredientId),
		index('recipe_ingredients_section_id_order_idx').on(table.recipeSectionId, table.order),
	],
);

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
	section: one(recipeSections, {
		fields: [recipeIngredients.recipeSectionId],
		references: [recipeSections.id],
	}),
	ingredient: one(ingredients, {
		fields: [recipeIngredients.ingredientId],
		references: [ingredients.id],
	}),
	unit: one(ingredientUnits, {
		fields: [recipeIngredients.unitId],
		references: [ingredientUnits.id],
	}),
	creator: one(users, {
		fields: [recipeIngredients.createdBy],
		references: [users.id],
		relationName: 'recipeIngredientCreator',
	}),
}));
