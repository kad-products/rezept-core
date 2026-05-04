import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const recipeScrapeStatus = [
	'SCRAPED',
	'TRANSFORMED',
	'VALIDATED',
	'RECIPE_SAVED',
	'SECTIONS_SAVED',
	'INGREDIENTS_SAVED',
	'INSTRUCTIONS_SAVED',
	'COMPLETED',
	'FAILED',
] as const;

export const recipeScrapes = sqliteTable(
	'recipe_scrapes',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		// Raw JSON is stored in R2 using the scrape ID as the object key (rezept_recipe_scrapes bucket)
		bodySize: integer().notNull(), // bytes
		status: text({ enum: recipeScrapeStatus }).notNull().default('SCRAPED'),
		statusText: text(),
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
	table => [index('recipe_scrapes_user_id_idx').on(table.userId)],
);

export const recipeScrapesRelations = relations(recipeScrapes, ({ one }) => ({
	user: one(users, {
		fields: [recipeScrapes.userId],
		references: [users.id],
		relationName: 'recipeScrapeUser',
	}),
	creator: one(users, {
		fields: [recipeScrapes.createdBy],
		references: [users.id],
		relationName: 'recipeScrapeCreator',
	}),
}));
