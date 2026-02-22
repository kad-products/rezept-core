import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/types';

vi.mock('@/repositories/users', () => ({
	getUserById: vi.fn(),
}));

vi.mock('@/session/store', () => ({
	sessions: {
		remove: vi.fn(),
	},
}));

import { getUserById } from '@/repositories/users';
import { sessions } from '@/session/store';
import userMiddleware from '../user';

const mockUser = {
	id: 'test-user-id',
	username: 'testuser',
	role: 'BASIC',
	createdAt: new Date().toString(),
	updatedAt: null,
} as User;

const mockRequestInfo = {
	ctx: {} as any,
	request: new Request('https://example.com/test'),
};

describe('userMiddleware', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx = {};
		mockRequestInfo.request = new Request('https://example.com/test');
	});

	it('does nothing when there is no session', async () => {
		await userMiddleware(mockRequestInfo as any);

		expect(getUserById).not.toHaveBeenCalled();
		expect(mockRequestInfo.ctx.user).toBeUndefined();
	});

	it('does nothing when session has no userId', async () => {
		mockRequestInfo.ctx.session = { userId: null };

		await userMiddleware(mockRequestInfo as any);

		expect(getUserById).not.toHaveBeenCalled();
		expect(mockRequestInfo.ctx.user).toBeUndefined();
	});

	it('sets ctx.user when session has a userId', async () => {
		mockRequestInfo.ctx.session = { userId: 'test-user-id' };
		vi.mocked(getUserById).mockResolvedValue(mockUser);

		await userMiddleware(mockRequestInfo as any);

		expect(getUserById).toHaveBeenCalledWith('test-user-id');
		expect(mockRequestInfo.ctx.user).toBe(mockUser);
	});

	it('redirects to / when getUserById throws', async () => {
		mockRequestInfo.ctx.session = { userId: 'test-user-id' };
		vi.mocked(getUserById).mockRejectedValue(new Error('DB error'));

		const result = await userMiddleware(mockRequestInfo as any);

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(302);
		expect((result as Response).headers.get('Location')).toBe('/');
	});

	it('removes session when getUserById throws', async () => {
		mockRequestInfo.ctx.session = { userId: 'test-user-id' };
		vi.mocked(getUserById).mockRejectedValue(new Error('DB error'));

		await userMiddleware(mockRequestInfo as any);

		expect(sessions.remove).toHaveBeenCalledWith(mockRequestInfo.request, expect.any(Headers));
	});
});
