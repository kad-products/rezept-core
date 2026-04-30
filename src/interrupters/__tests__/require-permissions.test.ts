import { beforeEach, describe, expect, it, vi } from 'vitest';

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

	it('returns a 403 Response when user is missing all required permissions', async () => {
		mockRequestInfo.ctx.permissions = [];

		const middleware = requirePermissions('recipes:create');
		const result = await middleware();

		expect(result).toBeInstanceOf(Response);
		expect(result?.status).toBe(403);

		const body = (await result?.json()) as { error: string; missing: string[] };
		expect(body.error).toBe('Forbidden');
		expect(body.missing).toContain('recipes:create');
	});

	it('returns a 403 Response when user is missing some required permissions', async () => {
		mockRequestInfo.ctx.permissions = ['recipes:create'];

		const middleware = requirePermissions('recipes:create', 'recipes:delete');
		const result = await middleware();

		expect(result).toBeInstanceOf(Response);
		expect(result?.status).toBe(403);

		const body = (await result?.json()) as { error: string; missing: string[] };
		expect(body.missing).toContain('recipes:delete');
		expect(body.missing).not.toContain('recipes:create');
	});

	it('returns a 403 Response when ctx.permissions is undefined', async () => {
		mockRequestInfo.ctx.permissions = undefined as any;

		const middleware = requirePermissions('recipes:create');
		const result = await middleware();

		expect(result).toBeInstanceOf(Response);
		expect(result?.status).toBe(403);
	});

	it('allows api key request with sufficient permissions', async () => {
		mockRequestInfo.ctx.apiKey = { permissions: ['recipes:upload'] };
		mockRequestInfo.ctx.permissions = ['recipes:upload'];

		const middleware = requirePermissions('recipes:upload');
		const result = await middleware();

		expect(result).toBeUndefined();
	});

	it('blocks api key request with insufficient permissions', async () => {
		mockRequestInfo.ctx.apiKey = { permissions: ['recipes:upload'] };
		mockRequestInfo.ctx.permissions = ['recipes:upload'];

		const middleware = requirePermissions('recipes:delete');
		const result = await middleware();

		expect(result).toBeInstanceOf(Response);
		expect(result?.status).toBe(403);
	});
});
