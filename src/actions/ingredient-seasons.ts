'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createIngredientSeason, updateIngredientSeason } from '@/repositories';
import { ingredientSeasonsSchemas } from '@/schemas';
import type { ActionState, IngredientSeasonDBRead, IngredientSeasonFormInput } from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveIngredientSeason = serverAction([
	requireAuthentication,
	requirePermissions('ingredients:update'),
	_saveIngredientSeason,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveIngredientSeason(formData: IngredientSeasonFormInput): Promise<ActionState<IngredientSeasonDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.debug('Ingredient season form data received', { id: formData.id, ingredientId: formData.ingredientId });

	try {
		const parsed = ingredientSeasonsSchemas.form.safeParse(formData);
		if (!parsed.success) {
			return errorResponse<IngredientSeasonDBRead>(parsed.error.flatten().fieldErrors, 400);
		}
		if (parsed.data.id) {
			const updatedIngredientSeason = await updateIngredientSeason(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
			return successResponse<IngredientSeasonDBRead>(updatedIngredientSeason);
		}
		const createdIngredientSeason = await createIngredientSeason(parsed.data, userId, requestInfo.ctx.logger);
		return successResponse<IngredientSeasonDBRead>(createdIngredientSeason);
	} catch (error) {
		requestInfo.ctx.logger.error('Failed to save ingredient season', { error });
		return errorResponse<IngredientSeasonDBRead>(error, 500, 'Failed to save ingredient season');
	}
}
