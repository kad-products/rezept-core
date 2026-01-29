import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { recipeSections } from './recipe-sections';
import { users } from './users';

export const recipes = sqliteTable(
	'recipes',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		authorId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: text().notNull(),
		description: text(),
		source: text(),
		servings: integer(),
		prepTime: integer(), // minutes
		cookTime: integer(), // minutes
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
	table => [index('recipes_author_id_idx').on(table.authorId)],
);

export const recipesRelations = relations(recipes, ({ many, one }) => ({
	sections: many(recipeSections),
	author: one(users, {
		fields: [recipes.authorId],
		references: [users.id],
		relationName: 'recipeAuthor',
	}),
	creator: one(users, {
		fields: [recipes.createdBy],
		references: [users.id],
		relationName: 'recipeCreator',
	}),
}));

export type Recipe = typeof recipes.$inferSelect;
export type RecipeInsert = typeof recipes.$inferInsert;
