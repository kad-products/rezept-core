import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { recipeSections } from './recipe-sections';
import { users } from './users';

export const recipeInstructions = sqliteTable(
	'recipe_instructions',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		recipeSectionId: text()
			.notNull()
			.references(() => recipeSections.id, { onDelete: 'cascade' }),
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
		index('recipe_instructions_section_id_idx').on(table.recipeSectionId),
		index('recipe_instructions_section_id_step_idx').on(table.recipeSectionId, table.stepNumber),
		uniqueIndex('recipe_instructions_recipe_section_id_step_number_unique').on(table.recipeSectionId, table.stepNumber),
	],
);

export const recipeInstructionsRelations = relations(recipeInstructions, ({ one }) => ({
	section: one(recipeSections, {
		fields: [recipeInstructions.recipeSectionId],
		references: [recipeSections.id],
	}),
	creator: one(users, {
		fields: [recipeInstructions.createdBy],
		references: [users.id],
		relationName: 'instructionCreator',
	}),
}));
