import crypto from 'node:crypto';
import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { ingredients } from './ingredients';
import { users } from './users';
import { verifications } from './verifications';

export const ingredientSeasons = sqliteTable(
	'ingredient_seasons',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		ingredientId: text()
			.notNull()
			.references(() => ingredients.id, { onDelete: 'cascade' }),
		country: text().notNull(),
		region: text(),
		startMonth: integer().notNull(), // 1-12
		endMonth: integer().notNull(), // 1-12
		notes: text(),
		lastVerifiedAt: text(),
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
		index('ingredient_seasons_ingredient_id_idx').on(table.ingredientId),
		index('ingredient_seasons_country_idx').on(table.country),
		index('ingredient_seasons_region_idx').on(table.region),
		index('ingredient_seasons_country_region_idx').on(table.country, table.region),
		uniqueIndex('ingredient_seasons_ingredient_id_country_region_unique')
			.on(table.ingredientId, table.country, table.region)
			.where(sql`"deleted_at" IS NULL`),
	],
);

export const ingredientSeasonsRelations = relations(ingredientSeasons, ({ one, many }) => ({
	ingredient: one(ingredients, {
		fields: [ingredientSeasons.ingredientId],
		references: [ingredients.id],
	}),
	creator: one(users, {
		fields: [ingredientSeasons.createdBy],
		references: [users.id],
		relationName: 'ingredientSeasonCreator',
	}),
	verifications: many(verifications),
}));
