import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzAccessError } from '@/classes';

const mockRequestInfo = {
	ctx: {
		user: null as { id: string; role?: string | null } | null,
		permissions: [] as string[],
		apiKey: undefined as { permissions: string[] } | undefined,
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
	getRequestInfo: () => mockRequestInfo,
}));

import { requirePermissions } from '@/interrupters';

describe('requirePermissions', () => {
	beforeEach(() => {
		mockRequestInfo.ctx.user = null;
		mockRequestInfo.ctx.permissions = [];
		mockRequestInfo.ctx.apiKey = undefined;
	});

	it('returns undefined when user has all required permissions', async () => {
		mockRequestInfo.ctx.permissions = ['recipes:create', 'recipes:update'];

		const middleware = requirePermissions('recipes:create', 'recipes:update');
		const result = await middleware();

		expect(result).toBeUndefined();
	});

	it('throws RzAccessError 500 if there is a perms check that has no indicated perms', async () => {
		expect(() => requirePermissions()).toThrow(RzAccessError);
	});

	it('throws RzAccessError 403 when user is missing all required permissions', async () => {
		mockRequestInfo.ctx.permissions = [];

		const middleware = requirePermissions('recipes:create');

		await expect(middleware()).rejects.toThrow(RzAccessError);
		await expect(middleware()).rejects.toMatchObject({ code: 403 });
	});

	it('throws RzAccessError 403 when user is missing some required permissions', async () => {
		mockRequestInfo.ctx.permissions = ['recipes:create'];

		const middleware = requirePermissions('recipes:create', 'recipes:delete');

		await expect(middleware()).rejects.toThrow(RzAccessError);
		await expect(middleware()).rejects.toMatchObject({ code: 403 });
	});

	it('throws RzAccessError 403 when ctx.permissions is undefined', async () => {
		mockRequestInfo.ctx.permissions = undefined as any;

		const middleware = requirePermissions('recipes:create');

		await expect(middleware()).rejects.toThrow(RzAccessError);
	});

	it('allows api key request with sufficient permissions', async () => {
		mockRequestInfo.ctx.apiKey = { permissions: ['recipes:upload'] };
		mockRequestInfo.ctx.permissions = ['recipes:upload'];

		const middleware = requirePermissions('recipes:upload');
		const result = await middleware();

		expect(result).toBeUndefined();
	});

	it('throws RzAccessError 403 for api key request with insufficient permissions', async () => {
		mockRequestInfo.ctx.apiKey = { permissions: ['recipes:upload'] };
		mockRequestInfo.ctx.permissions = ['recipes:upload'];

		const middleware = requirePermissions('recipes:delete');

		await expect(middleware()).rejects.toThrow(RzAccessError);
		await expect(middleware()).rejects.toMatchObject({ code: 403 });
	});
});
