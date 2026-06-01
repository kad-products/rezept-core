import type { recipeInstructions } from '@/models';

export type RecipeInstructionDBRead = typeof recipeInstructions.$inferSelect;
export type RecipeInstructionWriteInput = Omit<
	typeof recipeInstructions.$inferInsert,
	'recipeSectionId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type RecipeSectionInstructionsInput = {
	sectionId: string;
	instructions: RecipeInstructionWriteInput[];
};
