'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createGrowingZone, updateGrowingZone } from '@/repositories';
import { growingZonesSchemas } from '@/schemas';
import type { ActionState, GrowingZonesDBRead, GrowingZonesFormInput } from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveGrowingZone = serverAction([
	requireAuthentication,
	requirePermissions('growing-zones:update', 'growing-zones:create'),
	_saveGrowingZone,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveGrowingZone(formData: GrowingZonesFormInput): Promise<ActionState<GrowingZonesDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.debug('Growing zone form data received', { id: formData.id, code: formData.code });

	try {
		const parsed = growingZonesSchemas.form.safeParse(formData);
		if (!parsed.success) {
			return errorResponse<GrowingZonesDBRead>(parsed.error.flatten().fieldErrors, 400);
		}
		if (parsed.data.id) {
			const updatedGrowingZone = await updateGrowingZone(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
			return successResponse<GrowingZonesDBRead>(updatedGrowingZone);
		}
		const createdGrowingZone = await createGrowingZone(parsed.data, userId, requestInfo.ctx.logger);
		return successResponse<GrowingZonesDBRead>(createdGrowingZone);
	} catch (error) {
		requestInfo.ctx.logger.error('Failed to save growing zone', { error });
		return errorResponse<GrowingZonesDBRead>(error, 500, 'Failed to save growing zone');
	}
}
