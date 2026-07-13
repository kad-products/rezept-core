'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { verifyIngredient, verifyIngredientSeason } from '@/repositories';
import { verificationsSchemas } from '@/schemas';
import type { ActionState, VerificationsDBRead, VerificationsFormInput } from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveVerification = serverAction([
	requireAuthentication,
	requirePermissions('verifications:create'),
	_saveVerification,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveVerification(formData: VerificationsFormInput): Promise<ActionState<VerificationsDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.debug('Verification form data received', {
		id: formData.id,
		ingredientId: formData.ingredientId,
		ingredientSeasonId: formData.ingredientSeasonId,
	});

	try {
		const parsed = verificationsSchemas.form.safeParse(formData);
		if (!parsed.success) {
			return errorResponse<VerificationsDBRead>(parsed.error.flatten().fieldErrors, 400);
		}
		if (parsed.data.id) {
			requestInfo.ctx.logger.error('Updating existing verifications is not implemented yet');
			return errorResponse<VerificationsDBRead>(
				`Updating existing verifications is not implemented yet`,
				400,
				'Request included ID which indicates updating an existing verification which has not been implemented yet',
			);
		} else {
			if (parsed.data.ingredientId) {
				const ingredientVerification = await verifyIngredient(parsed.data.ingredientId, userId, requestInfo.ctx.logger);
				return successResponse<VerificationsDBRead>(ingredientVerification.verification);
			} else if (parsed.data.ingredientSeasonId) {
				const ingredientSeasonVerification = await verifyIngredientSeason(
					parsed.data.ingredientSeasonId,
					userId,
					requestInfo.ctx.logger,
				);
				return successResponse<VerificationsDBRead>(ingredientSeasonVerification.verification);
			}
		}
		requestInfo.ctx.logger.error('Request did not include ingredientId or ingredientSeasonId');
		return errorResponse<VerificationsDBRead>(
			`Request must include ingredientId or ingredientSeasonId`,
			400,
			'Request did not include ingredientId or ingredientSeasonId',
		);
	} catch (error) {
		requestInfo.ctx.logger.error('Failed to save verification', { error });
		return errorResponse<VerificationsDBRead>(error, 500, 'Failed to save verification');
	}
}
