import type { recipeIngredients } from '@/models';

export type RecipeIngredientDBRead = typeof recipeIngredients.$inferSelect;
export type RecipeIngredientFormSave = Omit<
	typeof recipeIngredients.$inferInsert,
	'recipeSectionId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type IncomingIngredientsData = {
	sectionId: string;
	ingredients: RecipeIngredientFormSave[] | undefined;
};
