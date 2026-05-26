import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { images } from './images';
import { users } from './users';

export const imageTypes = sqliteTable('image_types', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text().notNull().unique(),
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

export const imageTypesRelations = relations(imageTypes, ({ many, one }) => ({
	images: many(images, { relationName: 'imageTypeImages' }),
	creator: one(users, {
		fields: [imageTypes.createdBy],
		references: [users.id],
		relationName: 'imageTypeCreator',
	}),
}));
