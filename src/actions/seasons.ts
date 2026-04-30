'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createSeason, updateSeason } from '@/repositories/seasons';
import { seasonsSchemas } from '@/schemas';
import type { ActionState, SeasonFormSave } from '@/types';
import { errorResponse, successResponse } from './utils';

// biome-ignore lint/nursery/useExplicitType: WrappedServerFunction return type is not exported from rwsdk
export const saveSeason = serverAction([
	requireAuthentication,
	requirePermissions('seasons:create', 'seasons:update'),
	_saveSeason,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveSeason(formData: SeasonFormSave): Promise<ActionState<SeasonFormSave>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	try {
		if (formData.id) {
			const parsed = seasonsSchemas.update.safeParse(formData);
			if (!parsed.success) {
				requestInfo.ctx.logger.info(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
				return errorResponse<SeasonFormSave>(parsed.error.flatten().fieldErrors, 400);
			}
			const updatedSeason = await updateSeason(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
			return successResponse<SeasonFormSave>(updatedSeason);
		} else {
			const parsed = seasonsSchemas.create.safeParse(formData);
			if (!parsed.success) {
				requestInfo.ctx.logger.info(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
				return errorResponse<SeasonFormSave>(parsed.error.flatten().fieldErrors, 400);
			}
			const createdSeason = await createSeason(parsed.data, userId, requestInfo.ctx.logger);
			return successResponse<SeasonFormSave>(createdSeason);
		}
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving season: ${error} `);
		return errorResponse<SeasonFormSave>(error, 500, 'Failed to save season');
	}
}
