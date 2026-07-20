import type { ActionState, InSeasonRecipeSearchFormInput, RecipeDBRead } from '@/types';

export const submitRecipeSearch = async (_formData: InSeasonRecipeSearchFormInput): Promise<ActionState<RecipeDBRead[]>> => {
	return { success: true, code: 200, data: [] };
};
