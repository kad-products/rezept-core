import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { ingredients } from './ingredients';
import { seasons } from './seasons';
import { users } from './users';

export const seasonalIngredients = sqliteTable(
	'seasonal_ingredients',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		ingredientId: text()
			.notNull()
			.references(() => ingredients.id, { onDelete: 'cascade' }),
		seasonId: text()
			.notNull()
			.references(() => seasons.id, { onDelete: 'cascade' }),
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
	table => [
		index('seasonal_ingredients_ingredient_id_idx').on(table.ingredientId),
		index('seasonal_ingredients_season_id_idx').on(table.seasonId),
		uniqueIndex('seasonal_ingredients_ingredient_season_unique').on(table.ingredientId, table.seasonId),
	],
);

export const seasonalIngredientsRelations = relations(seasonalIngredients, ({ one }) => ({
	ingredient: one(ingredients, {
		fields: [seasonalIngredients.ingredientId],
		references: [ingredients.id],
	}),
	season: one(seasons, {
		fields: [seasonalIngredients.seasonId],
		references: [seasons.id],
	}),
	creator: one(users, {
		fields: [seasonalIngredients.createdBy],
		references: [users.id],
		relationName: 'seasonalIngredientCreator',
	}),
}));
