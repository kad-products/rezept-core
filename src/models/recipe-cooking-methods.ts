import crypto from 'node:crypto';
import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { recipeInstructions } from './recipe-instructions';
import { recipeSections } from './recipe-sections';
import { users } from './users';

export const recipeCookingMethods = sqliteTable(
	'recipe_cooking_methods',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		recipeSectionId: text()
			.notNull()
			.references(() => recipeSections.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		order: integer().notNull(),
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
		index('recipe_cooking_methods_section_id_idx').on(table.recipeSectionId),
		index('recipe_cooking_methods_section_id_name_idx').on(table.recipeSectionId, table.name),
		uniqueIndex('recipe_cooking_methods_recipe_section_id_name_unique')
			.on(table.recipeSectionId, table.name)
			.where(sql`"deleted_at" IS NULL`),
		index('recipe_cooking_methods_section_id_order_idx').on(table.recipeSectionId, table.order),
		uniqueIndex('recipe_cooking_methods_recipe_section_id_order_unique')
			.on(table.recipeSectionId, table.order)
			.where(sql`"deleted_at" IS NULL`),
	],
);

export const recipeCookingMethodsRelations = relations(recipeCookingMethods, ({ one, many }) => ({
	section: one(recipeSections, {
		fields: [recipeCookingMethods.recipeSectionId],
		references: [recipeSections.id],
	}),
	instructions: many(recipeInstructions),
	creator: one(users, {
		fields: [recipeCookingMethods.createdBy],
		references: [users.id],
		relationName: 'cookingMethodCreator',
	}),
}));
