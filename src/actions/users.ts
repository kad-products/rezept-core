'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { updateUser } from '@/repositories';
import { usersSchemas } from '@/schemas';
import type { ActionState, UserAdminEditInput } from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveUser = serverAction([requireAuthentication, requirePermissions('users:update'), _saveUser]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveUser(formData: UserAdminEditInput): Promise<ActionState<UserAdminEditInput>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	const parsed = usersSchemas.adminEdit.safeParse(formData);
	if (!parsed.success) {
		return errorResponse<UserAdminEditInput>(parsed.error.flatten().fieldErrors, 400);
	}

	try {
		const updated = await updateUser(
			parsed.data.id,
			{ username: parsed.data.username, role: parsed.data.role },
			userId,
			ctx.logger,
		);
		return successResponse<UserAdminEditInput>(updated);
	} catch (error) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed: users.username')) {
			return errorResponse<UserAdminEditInput>({ username: ['Username is already taken'] }, 400);
		}
		return errorResponse<UserAdminEditInput>(error, 500, 'Failed to save user');
	}
}
