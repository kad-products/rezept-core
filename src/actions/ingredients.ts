'use server';
import { requestInfo } from 'rwsdk/worker';
import { createIngredient } from '@/repositories/ingredients';
import type { ActionState, IngredientFormSave } from '@/types';
import { errorResponse, successResponse } from './utils';

export async function addIngredient(ingredientName: string): Promise<ActionState<IngredientFormSave>> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return errorResponse<IngredientFormSave>('You must be logged in to perform this action', 401);
	}

	requestInfo.ctx.logger.info(`Received on the server: ${ingredientName}`);

	const createdIngredient = await createIngredient({ name: ingredientName }, userId, requestInfo.ctx.logger);

	if (!createdIngredient) {
		return errorResponse<IngredientFormSave>('Failed to create ingredient', 500);
	}

	return successResponse<IngredientFormSave>(createdIngredient, 201);
}
