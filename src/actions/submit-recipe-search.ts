'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requirePermissions } from '@/interrupters';
import { searchRecipes } from '@/repositories';
import type { ActionState, InSeasonRecipeSearchFormInput, RecipeDBRead } from '@/types';
import { errorResponse, successResponse } from './utils';

export const submitRecipeSearch = serverAction([requirePermissions('recipes:read'), _submitRecipeSearch]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _submitRecipeSearch(formData: InSeasonRecipeSearchFormInput): Promise<ActionState<RecipeDBRead[]>> {
	try {
		requestInfo.ctx.logger.debug('In-season recipe search request received', {
			id: formData.growingZoneId,
			recipeSearchTerm: formData.recipeSearchTerm,
		});

		const matchedRecipes = await searchRecipes(
			{ growingZoneId: formData.growingZoneId, term: formData.recipeSearchTerm },
			requestInfo.ctx.logger,
		);

		return successResponse<RecipeDBRead[]>(matchedRecipes);
	} catch (err) {
		return errorResponse(err, 500, 'Search failed unexpectedly');
	}
}
