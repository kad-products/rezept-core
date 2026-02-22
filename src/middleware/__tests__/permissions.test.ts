import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequestInfo = {
	ctx: {
		user: null as { id: string; role?: string | null } | null,
		permissions: [] as string[],
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
	getRequestInfo: () => mockRequestInfo,
}));

import permissionsMiddleware, { requirePermissions } from '../permissions';

describe('permissionsMiddleware', () => {
	beforeEach(() => {
		mockRequestInfo.ctx.user = null;
		mockRequestInfo.ctx.permissions = [];
	});

	it('sets permissions on context for unauthenticated users', () => {
		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		expect(Array.isArray(mockRequestInfo.ctx.permissions)).toBe(true);
		expect(mockRequestInfo.ctx.permissions.length).toBeGreaterThan(0);

		// Should only have read permissions
		expect(mockRequestInfo.ctx.permissions.every(p => p.endsWith(':read'))).toBe(true);
	});

	it('sets permissions for BASIC role users', () => {
		mockRequestInfo.ctx.user = { id: 'user-123', role: 'BASIC' };

		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		expect(mockRequestInfo.ctx.permissions).toContain('recipes:create');
		expect(mockRequestInfo.ctx.permissions).toContain('recipes:update');
		expect(mockRequestInfo.ctx.permissions).not.toContain('seasons:create');
	});

	it('sets all permissions for ADMIN role users', () => {
		mockRequestInfo.ctx.user = { id: 'admin-123', role: 'ADMIN' };

		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		expect(mockRequestInfo.ctx.permissions).toContain('seasons:create');
		expect(mockRequestInfo.ctx.permissions).toContain('seasons:delete');
		expect(mockRequestInfo.ctx.permissions).toContain('recipes:create');
		expect(mockRequestInfo.ctx.permissions).toContain('recipes:delete');
	});

	it('handles users without a role', () => {
		mockRequestInfo.ctx.user = { id: 'user-123', role: null };

		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		expect(mockRequestInfo.ctx.permissions.every(p => p.endsWith(':read'))).toBe(true);
	});

	it('handles users with undefined role', () => {
		mockRequestInfo.ctx.user = { id: 'user-123', role: undefined };

		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		expect(mockRequestInfo.ctx.permissions.every(p => p.endsWith(':read'))).toBe(true);
	});

	it('handles users with unknown role', () => {
		mockRequestInfo.ctx.user = { id: 'user-123', role: 'UNKNOWN' };

		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		// Should only get public permissions
		expect(mockRequestInfo.ctx.permissions.every(p => p.endsWith(':read'))).toBe(true);
	});

	it('permissions array contains properly formatted strings', () => {
		mockRequestInfo.ctx.user = { id: 'user-123', role: 'ADMIN' };

		permissionsMiddleware(mockRequestInfo as any);

		mockRequestInfo.ctx.permissions.forEach(permission => {
			expect(typeof permission).toBe('string');
			expect(permission).toMatch(/^[\w]+:[\w]+$/);
		});
	});
});

describe('requirePermissions', () => {
	beforeEach(() => {
		mockRequestInfo.ctx.user = null;
		mockRequestInfo.ctx.permissions = [];
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
});
