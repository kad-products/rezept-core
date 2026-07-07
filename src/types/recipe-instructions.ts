import type { recipeInstructions } from '@/models';

export type RecipeInstructionDBRead = typeof recipeInstructions.$inferSelect;
export type RecipeInstructionWriteInput = Omit<
	typeof recipeInstructions.$inferInsert,
	'recipeCookingMethodId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type RecipeCookingMethodInstructionsInput = {
	cookingMethodId: string;
	instructions: RecipeInstructionWriteInput[];
};
