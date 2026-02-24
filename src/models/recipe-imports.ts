import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const recipeImportStatus = ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'] as const;

export const recipeImports = sqliteTable(
	'recipe_imports',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		originalFilename: text().notNull(),
		r2Key: text().notNull(),
		mimeType: text().notNull(),
		fileSize: integer().notNull(), // bytes
		status: text({ enum: recipeImportStatus }).notNull().default('UPLOADED'),
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
	table => [index('recipe_imports_user_id_idx').on(table.userId)],
);

export const recipeImportsRelations = relations(recipeImports, ({ one }) => ({
	user: one(users, {
		fields: [recipeImports.userId],
		references: [users.id],
		relationName: 'recipeImportUser',
	}),
	creator: one(users, {
		fields: [recipeImports.createdBy],
		references: [users.id],
		relationName: 'recipeImportCreator',
	}),
}));
