import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, successResponse } from '@/api/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { getRecipes } from '@/repositories';
import type { RecipeFilters } from '@/types';

export default {
	post: [requireAuthentication, requirePermissions('recipes:read'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ request, ctx }: RequestInfo<DefaultAppContext>): Promise<Response> {
	try {
		const { source } = (await request.json()) as RecipeFilters;

		const recipes = await getRecipes({ source }, 10, 0, ctx.logger);

		return successResponse(recipes);
	} catch (err) {
		return apiErrorResponse(err, 'Error getting recipes');
	}
}
