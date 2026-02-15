'use server';
import { requestInfo } from 'rwsdk/worker';

import { createIngredient } from '@/repositories/ingredients';

export async function addIngredient(ingredientName: string) {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	console.log(`Received on the server: ${ingredientName}`);

	return await createIngredient({ name: ingredientName }, userId);
}
