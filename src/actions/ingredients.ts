'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createIngredient } from '@/repositories';
import { ingredientsSchemas } from '@/schemas';
import type { ActionState, IngredientDBRead, IngredientFormInput } from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveIngredient = serverAction([
	requireAuthentication,
	requirePermissions('ingredients:create', 'ingredients:update'),
	_addIngredient,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _addIngredient(formData: IngredientFormInput): Promise<ActionState<IngredientDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	try {
		const parsed = ingredientsSchemas.form.safeParse(formData);
		if (!parsed.success) {
			return errorResponse<IngredientDBRead>(parsed.error.flatten().fieldErrors, 400);
		}
		const createdIngredient = await createIngredient({ name: parsed.data.name }, userId, requestInfo.ctx.logger);
		return successResponse<IngredientDBRead>(createdIngredient, 201);
	} catch (error) {
		requestInfo.ctx.logger.error('Failed to add ingredient', { error });
		return errorResponse<IngredientDBRead>(error, 500, 'Failed to add ingredient');
	}
}
