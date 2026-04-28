'use server';

import { requestInfo } from 'rwsdk/worker';
import { createSeason, updateSeason } from '@/repositories/seasons';
import { seasonsSchemas } from '@/schemas';
import type { ActionState, SeasonFormSave } from '@/types';
import { errorResponse, successResponse } from './utils';

export async function saveSeason(formData: SeasonFormSave): Promise<ActionState<SeasonFormSave>> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return errorResponse<SeasonFormSave>('You must be logged in to perform this action', 401);
	}

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	try {
		if (formData.id) {
			const parsed = seasonsSchemas.update.safeParse(formData);
			if (!parsed.success) {
				requestInfo.ctx.logger.info(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
				return errorResponse<SeasonFormSave>(parsed.error.flatten().fieldErrors, 400);
			}
			const updatedSeason = await updateSeason(parsed.data.id, parsed.data, userId);
			return successResponse<SeasonFormSave>(updatedSeason);
		} else {
			const parsed = seasonsSchemas.create.safeParse(formData);
			if (!parsed.success) {
				requestInfo.ctx.logger.info(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
				return errorResponse<SeasonFormSave>(parsed.error.flatten().fieldErrors, 400);
			}
			const createdSeason = await createSeason(parsed.data, userId);
			return successResponse<SeasonFormSave>(createdSeason);
		}
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving season: ${error} `);
		return errorResponse<SeasonFormSave>(error, 500, 'Failed to save season');
	}
}
