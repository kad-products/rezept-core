import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const recipeUploadStatus = ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'] as const;

export const recipeUploads = sqliteTable(
	'recipe_uploads',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		originalFilename: text().notNull(),
		mimeType: text().notNull(),
		fileSize: integer().notNull(), // bytes
		status: text({ enum: recipeUploadStatus }).notNull().default('UPLOADED'),
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
	table => [index('recipe_uploads_user_id_idx').on(table.userId)],
);

export const recipeUploadsRelations = relations(recipeUploads, ({ one }) => ({
	user: one(users, {
		fields: [recipeUploads.userId],
		references: [users.id],
		relationName: 'recipeUploadUser',
	}),
	creator: one(users, {
		fields: [recipeUploads.createdBy],
		references: [users.id],
		relationName: 'recipeUploadCreator',
	}),
}));
