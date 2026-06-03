'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createSeason, updateSeason } from '@/repositories';
import { seasonsSchemas } from '@/schemas';
import type { ActionState, SeasonDBRead, SeasonWriteInput } from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveSeason = serverAction([
	requireAuthentication,
	requirePermissions('seasons:create', 'seasons:update'),
	_saveSeason,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveSeason(formData: SeasonWriteInput): Promise<ActionState<SeasonDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	try {
		const parsed = seasonsSchemas.form.safeParse(formData);
		if (!parsed.success) {
			requestInfo.ctx.logger.info(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
			return errorResponse<SeasonDBRead>(parsed.error.flatten().fieldErrors, 400);
		}
		if (parsed.data.id) {
			const updatedSeason = await updateSeason(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
			return successResponse<SeasonDBRead>(updatedSeason);
		}
		const createdSeason = await createSeason(parsed.data, userId, requestInfo.ctx.logger);
		return successResponse<SeasonDBRead>(createdSeason);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving season: ${error} `);
		return errorResponse<SeasonDBRead>(error, 500, 'Failed to save season');
	}
}
