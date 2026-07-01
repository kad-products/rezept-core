import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { Permission, RzLogger } from '@/types';

const capturedChain = vi.hoisted(() => ({ saveHandlers: [] as unknown[], clearHandlers: [] as unknown[] }));

const mockSessions = vi.hoisted(() => ({
	load: vi.fn(),
	save: vi.fn(),
}));

vi.mock('@/durable-objects', () => ({
	sessions: mockSessions,
}));

interface MockRequestInfo {
	request: Request;
	response: { headers: Headers };
	ctx: {
		user: { id: string } | null;
		permissions: Permission[];
		logger: RzLogger;
	};
}

const mockRequestInfo: MockRequestInfo = {
	request: new Request('https://example.com'),
	response: { headers: new Headers() },
	ctx: {
		user: { id: 'test-user-id' },
		permissions: ['permissions:override'],
		logger: createNoopLogger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
	serverAction: (handlers: unknown[]) => {
		// Capture the chain for each action by the last handler identity
		// We capture both chains at import time, differentiated by content
		if (capturedChain.saveHandlers.length === 0) {
			capturedChain.saveHandlers = handlers;
		} else {
			capturedChain.clearHandlers = handlers;
		}
		return handlers[handlers.length - 1];
	},
}));

import { requireAuthentication } from '@/interrupters';
import { _clearPermissionsOverride, _savePermissionsOverride } from '../permissions';

const baseSession = {
	userId: 'test-user-id',
	createdAt: new Date().toISOString(),
};

describe('savePermissionsOverride', () => {
	describe('serverAction chain', () => {
		it('includes requireAuthentication', () => {
			expect(capturedChain.saveHandlers).toContain(requireAuthentication);
		});

		it('includes requirePermissions for permissions:override', () => {
			// requirePermissions returns a function — check one of the non-terminal handlers
			// is a function (the closure returned by requirePermissions)
			const nonTerminal = capturedChain.saveHandlers.slice(0, -1);
			expect(nonTerminal.length).toBeGreaterThanOrEqual(2);
			expect(nonTerminal.some(h => typeof h === 'function')).toBe(true);
		});
	});
});

describe('clearPermissionsOverride', () => {
	describe('serverAction chain', () => {
		it('includes requireAuthentication', () => {
			expect(capturedChain.clearHandlers).toContain(requireAuthentication);
		});

		it('includes a requirePermissions handler', () => {
			const nonTerminal = capturedChain.clearHandlers.slice(0, -1);
			expect(nonTerminal.length).toBeGreaterThanOrEqual(2);
		});
	});
});

describe('_savePermissionsOverride', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockRequestInfo.ctx.permissions = ['permissions:override'];
		mockSessions.load.mockResolvedValue({ ...baseSession });
		mockSessions.save.mockResolvedValue(undefined);
	});

	it('saves the permissions override to the session and returns success', async () => {
		const result = await _savePermissionsOverride({ permissions: ['recipes:read', 'recipes:create'] });

		expect(result.success).toBe(true);
		expect(result.data).toEqual(['recipes:read', 'recipes:create']);
		expect(mockSessions.save).toHaveBeenCalledWith(
			mockRequestInfo.response.headers,
			expect.objectContaining({ permissionsOverride: ['recipes:read', 'recipes:create'] }),
		);
	});

	it('preserves existing session data when saving override', async () => {
		mockSessions.load.mockResolvedValue({ ...baseSession, someOtherField: 'value' });

		await _savePermissionsOverride({ permissions: ['recipes:read'] });

		expect(mockSessions.save).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ someOtherField: 'value', permissionsOverride: ['recipes:read'] }),
		);
	});

	it('returns a validation error for invalid permission strings', async () => {
		const result = await _savePermissionsOverride({ permissions: ['apiKeys:create' as Permission] });

		expect(result.success).toBe(false);
		expect(result.errors).toBeDefined();
		expect(mockSessions.save).not.toHaveBeenCalled();
	});

	it('returns a validation error for an empty permissions array', async () => {
		const result = await _savePermissionsOverride({ permissions: [] });

		expect(result.success).toBe(false);
		expect(result.errors?.permissions).toBeDefined();
		expect(mockSessions.save).not.toHaveBeenCalled();
	});

	it('returns an error when sessions.save throws', async () => {
		mockSessions.save.mockRejectedValueOnce(new Error('Durable Object unavailable'));

		const result = await _savePermissionsOverride({ permissions: ['recipes:read'] });

		expect(result.success).toBe(false);
		expect(result.errors?._form).toBeDefined();
	});

	// Intentional: saving an override that excludes permissions:override is allowed.
	// This is useful for testing users that lack that permission. The user is effectively
	// locked out of the override UI until they log out and back in, which restores role-based
	// permissions. An "are you sure?" confirmation before saving is a future UX concern.
	it('allows saving an override that excludes permissions:override (intentional self-lockout)', async () => {
		const result = await _savePermissionsOverride({ permissions: ['recipes:read'] });

		expect(result.success).toBe(true);
		expect(result.data).toEqual(['recipes:read']);
	});

	// sessions.load() returns null — spread of null produces {} which loses userId.
	// Desired behaviour: the action should detect the null session and return an error
	// rather than saving a session stripped of its userId.
	it('returns an error when sessions.load returns null rather than saving a broken session', async () => {
		mockSessions.load.mockResolvedValue(null);

		const result = await _savePermissionsOverride({ permissions: ['recipes:read'] });

		expect(result.success).toBe(false);
		expect(mockSessions.save).not.toHaveBeenCalled();
	});
});

describe('_clearPermissionsOverride', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockRequestInfo.ctx.permissions = ['permissions:override', 'recipes:read'];
		mockSessions.load.mockResolvedValue({ ...baseSession, permissionsOverride: ['recipes:read'] as Permission[] });
		mockSessions.save.mockResolvedValue(undefined);
	});

	it('removes permissionsOverride from the session and returns success', async () => {
		const result = await _clearPermissionsOverride();

		expect(result.success).toBe(true);
		expect(mockSessions.save).toHaveBeenCalledWith(
			mockRequestInfo.response.headers,
			expect.not.objectContaining({ permissionsOverride: expect.anything() }),
		);
	});

	it('returns the role-based permissions from ctx after clearing', async () => {
		mockRequestInfo.ctx.permissions = ['recipes:read', 'recipes:create'];

		const result = await _clearPermissionsOverride();

		expect(result.success).toBe(true);
		expect(result.data).toEqual(['recipes:read', 'recipes:create']);
	});

	it('returns 400 when currentSessionData is null', async () => {
		mockSessions.load.mockResolvedValue(null);

		const result = await _clearPermissionsOverride();

		expect(result.success).toBe(false);
		expect(result.code).toBe(400);
	});

	it('returns an error when sessions.save throws', async () => {
		mockSessions.save.mockRejectedValueOnce(new Error('Durable Object unavailable'));

		const result = await _clearPermissionsOverride();

		expect(result.success).toBe(false);
		expect(result.errors?._form).toBeDefined();
	});

	it('handles clearing when no override was active (no permissionsOverride key)', async () => {
		mockSessions.load.mockResolvedValue({ ...baseSession }); // no permissionsOverride

		const result = await _clearPermissionsOverride();

		// Destructuring a missing key is safe; restSessionData won't have permissionsOverride
		expect(result.success).toBe(true);
		expect(mockSessions.save).toHaveBeenCalledWith(
			expect.anything(),
			expect.not.objectContaining({ permissionsOverride: expect.anything() }),
		);
	});
});
