import type { z } from 'zod';
import type { recipes } from '@/models';
import type { recipeFormSchema } from '@/schemas';
import type { RecipeIngredient, RecipeInstruction, RecipeSection } from '@/types';

export type Recipe = typeof recipes.$inferSelect;
export type RecipeFormSave = Omit<
	typeof recipes.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

// One type for everything
export type RecipeFormData = z.infer<typeof recipeFormSchema>;

export type RecipeWithSections = Recipe & {
	sections: Array<
		RecipeSection & {
			ingredients: RecipeIngredient[];
			instructions: RecipeInstruction[];
		}
	>;
};
