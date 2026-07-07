import crypto from 'node:crypto';
import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { recipeCookingMethods } from './recipe-cooking-methods';
import { users } from './users';

export const recipeInstructions = sqliteTable(
	'recipe_instructions',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		recipeCookingMethodId: text()
			.notNull()
			.references(() => recipeCookingMethods.id, { onDelete: 'cascade' }),
		stepNumber: integer().notNull(),
		instruction: text().notNull(),
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
		index('recipe_instructions_cooking_method_id_idx').on(table.recipeCookingMethodId),
		index('recipe_instructions_cooking_method_id_step_idx').on(table.recipeCookingMethodId, table.stepNumber),
		uniqueIndex('recipe_instructions_recipe_cooking_method_id_step_number_unique')
			.on(table.recipeCookingMethodId, table.stepNumber)
			.where(sql`"deleted_at" IS NULL`),
	],
);

export const recipeInstructionsRelations = relations(recipeInstructions, ({ one }) => ({
	cookingMethod: one(recipeCookingMethods, {
		fields: [recipeInstructions.recipeCookingMethodId],
		references: [recipeCookingMethods.id],
	}),
	creator: one(users, {
		fields: [recipeInstructions.createdBy],
		references: [users.id],
		relationName: 'instructionCreator',
	}),
}));
