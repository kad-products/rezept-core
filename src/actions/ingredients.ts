'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createIngredient } from '@/repositories';
import { ingredientsSchemas } from '@/schemas';
import type { ActionState, IngredientFormSave } from '@/types';
import { errorResponse, successResponse } from './utils';

// biome-ignore lint/nursery/useExplicitType: WrappedServerFunction return type is not exported from rwsdk
export const saveIngredient = serverAction([
	requireAuthentication,
	requirePermissions('ingredients:create', 'ingredients:update'),
	_addIngredient,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _addIngredient(formData: IngredientFormSave): Promise<ActionState<IngredientFormSave>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	try {
		const parsed = ingredientsSchemas.form.safeParse(formData);
		if (!parsed.success) {
			requestInfo.ctx.logger.info(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
			return errorResponse<IngredientFormSave>(parsed.error.flatten().fieldErrors, 400);
		}
		const createdIngredient = await createIngredient({ name: parsed.data.name }, userId, requestInfo.ctx.logger);
		return successResponse<IngredientFormSave>(createdIngredient, 201);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error adding ingredient: ${error} `);
		return errorResponse<IngredientFormSave>(error, 500, 'Failed to add ingredient');
	}
}
