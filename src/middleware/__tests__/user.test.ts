import { beforeEach, describe, expect, it, vi } from 'vitest';
import Logger from '@/logger';
import type { User } from '@/types';

vi.mock('@/repositories', () => ({
	getUserById: vi.fn(),
}));

vi.mock('@/durable-objects', () => ({
	sessions: {
		remove: vi.fn(),
	},
}));

import { sessions } from '@/durable-objects';
import { getUserById } from '@/repositories';
import userMiddleware from '../user';

const mockUser = {
	id: 'test-user-id',
	username: 'testuser',
	role: 'BASIC',
	createdAt: new Date().toString(),
	updatedAt: null,
} as User;

const mockRequestInfo = {
	ctx: {
		logger: new Logger(),
	} as any,
	request: new Request('https://example.com/test'),
	response: {
		headers: new Headers(),
	},
};

describe('userMiddleware', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx = {
			logger: new Logger(),
		};
		mockRequestInfo.request = new Request('https://example.com/test');
		mockRequestInfo.response = { headers: new Headers() };
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

		expect(getUserById).toHaveBeenCalledWith('test-user-id', expect.anything());
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
