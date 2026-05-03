import type { recipeInstructions } from '@/models';

export type RecipeInstructionDBRead = typeof recipeInstructions.$inferSelect;
export type RecipeInstructionFormSave = Omit<
	typeof recipeInstructions.$inferInsert,
	'recipeSectionId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type IncomingInstructionsData = {
	sectionId: string;
	instructions: RecipeInstructionFormSave[] | undefined;
};
