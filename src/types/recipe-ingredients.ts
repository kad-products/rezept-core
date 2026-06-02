import type { recipeIngredients } from '@/models';

export type RecipeIngredientDBRead = typeof recipeIngredients.$inferSelect;
export type RecipeIngredientWriteInput = Omit<
	typeof recipeIngredients.$inferInsert,
	'recipeSectionId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type RecipeSectionIngredientsInput = {
	sectionId: string;
	ingredients: RecipeIngredientWriteInput[];
};
