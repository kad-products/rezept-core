import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ingredientSeasons } from './ingredient-seasons';
import { ingredients } from './ingredients';
import { users } from './users';

export const verifications = sqliteTable(
	'verifications',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		ingredientId: text().references(() => ingredients.id, { onDelete: 'cascade' }),
		ingredientSeasonId: text().references(() => ingredientSeasons.id, { onDelete: 'cascade' }),
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
		index('verifications_ingredient_id_idx').on(table.ingredientId),
		index('verifications_ingredient_season_id_idx').on(table.ingredientSeasonId),
	],
);

export const verificationsRelations = relations(verifications, ({ one }) => ({
	ingredient: one(ingredients, {
		fields: [verifications.ingredientId],
		references: [ingredients.id],
	}),
	ingredientSeason: one(ingredientSeasons, {
		fields: [verifications.ingredientSeasonId],
		references: [ingredientSeasons.id],
	}),
	creator: one(users, {
		fields: [verifications.createdBy],
		references: [users.id],
		relationName: 'verificationCreator',
	}),
}));
