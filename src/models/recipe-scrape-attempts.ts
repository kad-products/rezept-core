import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { recipeScrapeStatus, recipeScrapes } from './recipe-scrapes';
import { users } from './users';

export const recipeScrapeAttemptSource = ['api', 'workflow'] as const;

export const recipeScrapeAttempts = sqliteTable(
	'recipe_scrape_attempts',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		recipeScrapeId: text()
			.notNull()
			.references(() => recipeScrapes.id, { onDelete: 'cascade' }),
		source: text({ enum: recipeScrapeAttemptSource }).notNull().default('api'),
		workflowInstanceId: text(),
		status: text({ enum: recipeScrapeStatus }).notNull(),
		statusText: text(),
		appVersion: text(),
		createdAt: text()
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		createdBy: text()
			.notNull()
			.references(() => users.id),
	},
	table => [
		index('recipe_scrape_attempts_scrape_id_idx').on(table.recipeScrapeId),
		index('recipe_scrape_attempts_status_idx').on(table.status),
	],
);

export const recipeScrapeAttemptsRelations = relations(recipeScrapeAttempts, ({ one }) => ({
	scrape: one(recipeScrapes, {
		fields: [recipeScrapeAttempts.recipeScrapeId],
		references: [recipeScrapes.id],
		relationName: 'recipeScrapeAttemptScrape',
	}),
	creator: one(users, {
		fields: [recipeScrapeAttempts.createdBy],
		references: [users.id],
		relationName: 'recipeScrapeAttemptCreator',
	}),
}));
