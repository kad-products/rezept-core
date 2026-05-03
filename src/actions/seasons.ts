'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createSeason, updateSeason } from '@/repositories';
import { seasonsSchemas } from '@/schemas';
import type { ActionState, SeasonWriteInput } from '@/types';
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
export async function _saveSeason(formData: SeasonWriteInput): Promise<ActionState<SeasonWriteInput>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	try {
		const parsed = seasonsSchemas.form.safeParse(formData);
		if (!parsed.success) {
			requestInfo.ctx.logger.info(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
			return errorResponse<SeasonWriteInput>(parsed.error.flatten().fieldErrors, 400);
		}
		if (parsed.data.id) {
			const updatedSeason = await updateSeason(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
			return successResponse<SeasonWriteInput>(updatedSeason);
		}
		const createdSeason = await createSeason(parsed.data, userId, requestInfo.ctx.logger);
		return successResponse<SeasonWriteInput>(createdSeason);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving season: ${error} `);
		return errorResponse<SeasonWriteInput>(error, 500, 'Failed to save season');
	}
}
