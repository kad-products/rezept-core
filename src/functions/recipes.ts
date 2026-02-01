'use server';

import { env } from 'cloudflare:workers';
import { requestInfo } from 'rwsdk/worker';
import {
	createRecipe,
	createRecipeFormValidationSchema,
	updateRecipe,
} from '@/repositories/recipes';
import type { ActionState } from '@/types';
import { formDataToObject } from '@/utils';

export async function saveRecipe(
	_prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	const formDataObj = formDataToObject(formData);

	console.log(`Form data received: ${JSON.stringify(formDataObj, null, 4)} `);

	const parsed = createRecipeFormValidationSchema.safeParse(formDataObj);

	console.log(`Form data received: ${JSON.stringify(parsed, null, 4)} `);

	if (!parsed.success) {
		console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	try {
		if (!parsed.data.id) {
			await createRecipe(parsed.data, userId);
		} else {
			await updateRecipe(parsed.data.id, parsed.data, userId);
		}

		return { success: true };
	} catch (error) {
		console.log(`Error saving recipe: ${error} `);

		console.log(error);

		const errorMessage =
			env.REZEPT_ENV === 'development'
				? error instanceof Error
					? error.message
					: String(error)
				: 'Failed to save recipe';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}
}
