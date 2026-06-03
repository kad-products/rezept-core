import type { recipeIngredients } from '@/models';
import type { IngredientUnitDBRead } from '@/types';

export type RecipeIngredientDBRead = typeof recipeIngredients.$inferSelect;

export type RecipeIngredientWithUnit = RecipeIngredientDBRead & {
	unit: IngredientUnitDBRead | null;
};

export type RecipeIngredientWriteInput = Omit<
	typeof recipeIngredients.$inferInsert,
	'recipeSectionId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type RecipeSectionIngredientsInput = {
	sectionId: string;
	ingredients: RecipeIngredientWriteInput[];
};
