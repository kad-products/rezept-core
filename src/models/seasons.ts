import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { seasonalIngredients } from './seasonal-ingredients';
import { users } from './users';

export const seasons = sqliteTable(
	'seasons',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text().notNull(),
		description: text(),
		country: text().notNull(),
		region: text(),
		startMonth: integer().notNull(), // 1-12
		endMonth: integer().notNull(), // 1-12
		notes: text(),
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
		index('seasons_country_idx').on(table.country),
		index('seasons_region_idx').on(table.region),
		index('seasons_country_region_idx').on(table.country, table.region),
	],
);

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
	seasonalIngredients: many(seasonalIngredients),
	creator: one(users, {
		fields: [seasons.createdBy],
		references: [users.id],
		relationName: 'seasonCreator',
	}),
}));
