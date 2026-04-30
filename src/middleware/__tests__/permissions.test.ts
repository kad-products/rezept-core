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

import permissionsMiddleware from '../permissions';

describe('permissionsMiddleware', () => {
	beforeEach(() => {
		mockRequestInfo.ctx.user = null;
		mockRequestInfo.ctx.permissions = [];
		mockRequestInfo.ctx.apiKey = undefined;
	});

	it('sets permissions on context for unauthenticated users', () => {
		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		expect(Array.isArray(mockRequestInfo.ctx.permissions)).toBe(true);
		expect(mockRequestInfo.ctx.permissions.length).toBeGreaterThan(0);

		// Should only have read permissions
		expect(mockRequestInfo.ctx.permissions.every(p => p.endsWith(':read') || p.endsWith(':login'))).toBe(true);
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
		expect(mockRequestInfo.ctx.permissions.every(p => p.endsWith(':read') || p.endsWith(':login'))).toBe(true);
	});

	it('handles users with undefined role', () => {
		mockRequestInfo.ctx.user = { id: 'user-123', role: undefined };

		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		expect(mockRequestInfo.ctx.permissions.every(p => p.endsWith(':read') || p.endsWith(':login'))).toBe(true);
	});

	it('handles users with unknown role', () => {
		mockRequestInfo.ctx.user = { id: 'user-123', role: 'UNKNOWN' };

		permissionsMiddleware(mockRequestInfo as any);

		expect(mockRequestInfo.ctx.permissions).toBeDefined();
		// Should only get public permissions
		expect(mockRequestInfo.ctx.permissions.every(p => p.endsWith(':read'))).toBe(true);
	});

	describe('api key permissions', () => {
		it('uses api key permissions when ctx.apiKey is set', () => {
			mockRequestInfo.ctx.apiKey = { permissions: ['recipes:upload'] };

			permissionsMiddleware(mockRequestInfo as any);

			expect(mockRequestInfo.ctx.permissions).toEqual(['recipes:upload']);
		});

		it('uses api key permissions even when user is also set', () => {
			mockRequestInfo.ctx.user = { id: 'user-123', role: 'ADMIN' };
			mockRequestInfo.ctx.apiKey = { permissions: ['recipes:upload'] };

			permissionsMiddleware(mockRequestInfo as any);

			expect(mockRequestInfo.ctx.permissions).toEqual(['recipes:upload']);
			expect(mockRequestInfo.ctx.permissions).not.toContain('seasons:create');
		});

		it('sets empty permissions when api key has no permissions', () => {
			mockRequestInfo.ctx.apiKey = { permissions: [] };

			permissionsMiddleware(mockRequestInfo as any);

			expect(mockRequestInfo.ctx.permissions).toEqual([]);
		});

		it('sets multiple permissions from api key', () => {
			mockRequestInfo.ctx.apiKey = { permissions: ['recipes:upload', 'recipes:read'] };

			permissionsMiddleware(mockRequestInfo as any);

			expect(mockRequestInfo.ctx.permissions).toContain('recipes:upload');
			expect(mockRequestInfo.ctx.permissions).toContain('recipes:read');
		});

		it('falls back to role-based permissions when ctx.apiKey is undefined', () => {
			mockRequestInfo.ctx.user = { id: 'user-123', role: 'ADMIN' };
			mockRequestInfo.ctx.apiKey = undefined;

			permissionsMiddleware(mockRequestInfo as any);

			expect(mockRequestInfo.ctx.permissions).toContain('seasons:create');
		});
	});
});
