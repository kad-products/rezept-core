import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));

vi.mock('@/repositories', () => ({
	updateUser: vi.fn(),
}));

vi.mock('cloudflare:workers', () => ({
	env: mockEnv,
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
		logger: RzLogger;
	};
}

const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: { id: 'test-user-id' },
		logger: new Logger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	serverAction: (handlers: unknown[]) => (Array.isArray(handlers) ? handlers[handlers.length - 1] : handlers),
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { randomUUID } from 'node:crypto';
import { updateUser } from '@/repositories';
import type { UserAdminEditInput, UserDBRead } from '@/types';
import { _saveUser } from '../users';

const mockUser = { id: randomUUID(), username: 'testuser', role: 'BASIC' as const } as unknown as UserDBRead;
const validInput: UserAdminEditInput = { id: mockUser.id, username: 'testuser', role: 'ADMIN' };

describe('_saveUser', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockEnv.REZEPT_ENV = 'development';
		vi.mocked(updateUser).mockResolvedValue(mockUser);
	});

	it('updates username and role and returns success', async () => {
		const result = await _saveUser(validInput);

		expect(updateUser).toHaveBeenCalledWith(
			mockUser.id,
			{ username: 'testuser', role: 'ADMIN' },
			'test-user-id',
			expect.anything(),
		);
		expect(result.success).toBe(true);
	});

	it('returns field errors when id is invalid', async () => {
		const result = await _saveUser({ ...validInput, id: 'not-a-uuid' });

		expect(result.success).toBe(false);
		expect(result.errors?.id).toBeDefined();
		expect(updateUser).not.toHaveBeenCalled();
	});

	it('returns field errors when role is invalid', async () => {
		const result = await _saveUser({ ...validInput, role: 'SUPERUSER' as UserAdminEditInput['role'] });

		expect(result.success).toBe(false);
		expect(result.errors?.role).toBeDefined();
		expect(updateUser).not.toHaveBeenCalled();
	});

	it('returns field errors when username is empty', async () => {
		const result = await _saveUser({ ...validInput, username: '' });

		expect(result.success).toBe(false);
		expect(result.errors?.username).toBeDefined();
		expect(updateUser).not.toHaveBeenCalled();
	});

	it('returns a username field error when the username is already taken', async () => {
		vi.mocked(updateUser).mockRejectedValue(new Error('UNIQUE constraint failed: users.username'));

		const result = await _saveUser(validInput);

		expect(result.success).toBe(false);
		expect(result.code).toBe(400);
		expect(result.errors?.username?.[0]).toBe('Username is already taken');
	});

	it('returns 500 error in dev when repository throws unexpectedly', async () => {
		vi.mocked(updateUser).mockRejectedValue(new Error('DB error'));

		const result = await _saveUser(validInput);

		expect(result.success).toBe(false);
		expect(result.code).toBe(500);
		expect(result.errors?._form?.[0]).toContain('DB error');
	});

	it('returns generic message in production when repository throws unexpectedly', async () => {
		mockEnv.REZEPT_ENV = 'production';
		vi.mocked(updateUser).mockRejectedValue(new Error('DB error'));

		const result = await _saveUser(validInput);

		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toBe('Failed to save user');
	});
});
