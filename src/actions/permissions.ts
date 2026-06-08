'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { sessions } from '@/durable-objects';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { permissionsOverrideSchemas } from '@/schemas';
import type { ActionState, Permission } from '@/types';
import { errorResponse, successResponse } from './utils';

export const savePermissionsOverride = serverAction([
	requireAuthentication,
	requirePermissions('permissions:override'),
	_savePermissionsOverride,
]);

export const clearPermissionsOverride = serverAction([
	requireAuthentication,
	requirePermissions('permissions:override'),
	_clearPermissionsOverride,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _savePermissionsOverride(formData: { permissions: Permission[] }): Promise<ActionState<Permission[]>> {
	const { ctx, response } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.debug('Permissions override form data received', { ...formData });

	const parsed = permissionsOverrideSchemas.form.safeParse(formData);

	if (parsed.error) {
		return errorResponse<Permission[]>(parsed.error.flatten().fieldErrors, 400);
	}

	try {
		const currentSessionData = await sessions.load(requestInfo.request);
		if (!currentSessionData) {
			return errorResponse('No active session', 400);
		}
		await sessions.save(response.headers, {
			...currentSessionData,
			permissionsOverride: parsed.data.permissions,
		});
		requestInfo.ctx.logger.info('Permissions override saved', { userId, permissions: parsed.data });

		return successResponse<Permission[]>(parsed.data.permissions, 200);
	} catch (error) {
		requestInfo.ctx.logger.error('Failed to save permissions override', { error });
		return errorResponse<Permission[]>(error, 400, 'Failed to save permissions override');
	}
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _clearPermissionsOverride(): Promise<ActionState<Permission[]>> {
	const { ctx, response } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	try {
		const currentSessionData = await sessions.load(requestInfo.request);
		// this really should never be possible since the session middleware will generate a session if one doesn't exist, but we'll check to satisfy TypeScript and just return a 400 if it somehow happens
		if (!currentSessionData) {
			return errorResponse('No active session', 400);
		}
		const { permissionsOverride, ...restSessionData } = currentSessionData;

		await sessions.save(response.headers, restSessionData);
		requestInfo.ctx.logger.info('Permissions override cleared', { userId });

		return successResponse<Permission[]>(ctx.permissions || [], 200);
	} catch (error) {
		requestInfo.ctx.logger.error('Failed to clear permissions override', { error });
		return errorResponse<Permission[]>(error, 400, 'Failed to clear permissions override');
	}
}
