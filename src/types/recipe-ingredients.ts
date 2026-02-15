import type { recipeIngredients } from '@/models';

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type RecipeIngredientFormSave = Omit<
	typeof recipeIngredients.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
