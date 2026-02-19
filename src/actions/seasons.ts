'use server';

import { env } from 'cloudflare:workers';
import { requestInfo } from 'rwsdk/worker';
import { createSeason, updateSeason } from '@/repositories/seasons';
import { createSeasonSchema, updateSeasonSchema } from '@/schemas';
import type { ActionState, SeasonFormSave } from '@/types';

export async function saveSeason(formData: SeasonFormSave): Promise<ActionState<SeasonFormSave>> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	console.log(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	try {
		if (formData.id) {
			const parsed = updateSeasonSchema.safeParse(formData);
			if (!parsed.success) {
				console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
				return {
					success: false,
					errors: parsed.error.flatten().fieldErrors,
				};
			}
			const updatedSeason = await updateSeason(parsed.data.id, parsed.data, userId);
			return { success: true, data: updatedSeason };
		} else {
			const parsed = createSeasonSchema.safeParse(formData);
			if (!parsed.success) {
				console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
				return {
					success: false,
					errors: parsed.error.flatten().fieldErrors,
				};
			}
			const createdSeason = await createSeason(parsed.data, userId);
			return { success: true, data: createdSeason };
		}
	} catch (error) {
		console.log(`Error saving season: ${error} `);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save season';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}
}
