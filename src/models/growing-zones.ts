import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ingredientSeasons } from './ingredient-seasons';
import { users } from './users';

export const growingZones = sqliteTable('growing_zones', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	code: text().notNull().unique(),
	name: text().notNull(),
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

export const growingZonesRelations = relations(growingZones, ({ one, many }) => ({
	seasons: many(ingredientSeasons),
	creator: one(users, {
		fields: [growingZones.createdBy],
		references: [users.id],
		relationName: 'growingZonesCreator',
	}),
}));
