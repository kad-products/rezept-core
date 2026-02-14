import type { recipeInstructions } from '@/models';

export type RecipeInstruction = typeof recipeInstructions.$inferSelect;
export type RecipeInstructionFormSave = Omit<
	typeof recipeInstructions.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
