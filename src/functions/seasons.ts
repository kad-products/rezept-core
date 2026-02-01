'use server';

import { env } from 'cloudflare:workers';
import { requestInfo } from 'rwsdk/worker';
import { updateSeasonalIngredientsForSeason } from '@/repositories/seasonal-ingredients';
import {
	createSeason,
	createSeasonFormValidationSchema,
	updateSeason,
} from '@/repositories/seasons';
import type { ActionState } from '@/types';
import { formDataToObject } from '@/utils';

export async function saveSeason(
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

	const parsed = createSeasonFormValidationSchema.safeParse(formDataObj);

	console.log(`Form data received: ${JSON.stringify(parsed, null, 4)} `);

	if (!parsed.success) {
		console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	try {
		let seasonId: string = parsed.data.id || '';
		if (!parsed.data.id) {
			const [newSeason] = await createSeason(parsed.data, userId);
			seasonId = newSeason.id;
		} else {
			await updateSeason(parsed.data.id, parsed.data, userId);
		}

		if (formDataObj.ingredients) {
			const ingredientIds = Array.isArray(formDataObj.ingredients)
				? formDataObj.ingredients
				: [formDataObj.ingredients];

			console.log(`Updating seasonal ingredients: ${JSON.stringify(ingredientIds, null, 4)} `);

			await updateSeasonalIngredientsForSeason(seasonId, ingredientIds, userId);
		}

		return { success: true };
	} catch (error) {
		console.log(`Error saving season: ${error} `);

		console.log(error);

		const errorMessage =
			env.REZEPT_ENV === 'development'
				? error instanceof Error
					? error.message
					: String(error)
				: 'Failed to save season';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}
}
