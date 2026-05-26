import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { imageTypes } from './image-types';
import { users } from './users';

export const images = sqliteTable(
	'images',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		imageTypeId: text()
			.notNull()
			.references(() => imageTypes.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		description: text(),
		originalFilename: text().notNull(),
		// R2 key is always the image id — no separate r2Key column needed
		mimeType: text().notNull(),
		fileSize: integer().notNull(), // bytes
		width: integer(), // pixels
		height: integer(), // pixels
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
	table => [index('images_image_type_id_idx').on(table.imageTypeId)],
);

export const imagesRelations = relations(images, ({ one }) => ({
	imageType: one(imageTypes, {
		fields: [images.imageTypeId],
		references: [imageTypes.id],
		relationName: 'imageTypeImages',
	}),
	creator: one(users, {
		fields: [images.createdBy],
		references: [users.id],
		relationName: 'imageCreator',
	}),
}));
