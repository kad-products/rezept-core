import crypto from 'node:crypto';
import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { growingZones } from './growing-zones';
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
		growingZoneId: text()
			.notNull()
			.references(() => growingZones.id, { onDelete: 'cascade' }),
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
		index('ingredient_seasons_growing_zone_id_idx').on(table.growingZoneId),
		uniqueIndex('ingredient_seasons_ingredient_id_growing_zone_id_unique')
			.on(table.ingredientId, table.growingZoneId)
			.where(sql`"deleted_at" IS NULL`),
	],
);

export const ingredientSeasonsRelations = relations(ingredientSeasons, ({ one, many }) => ({
	ingredient: one(ingredients, {
		fields: [ingredientSeasons.ingredientId],
		references: [ingredients.id],
	}),
	growingZone: one(growingZones, {
		fields: [ingredientSeasons.growingZoneId],
		references: [growingZones.id],
	}),
	creator: one(users, {
		fields: [ingredientSeasons.createdBy],
		references: [users.id],
		relationName: 'ingredientSeasonCreator',
	}),
	verifications: many(verifications),
}));
