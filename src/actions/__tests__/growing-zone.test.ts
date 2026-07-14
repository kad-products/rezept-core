import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
const capturedChain = vi.hoisted(() => ({ handlers: [] as unknown[] }));

vi.mock('@/repositories', () => ({
	createGrowingZone: vi.fn(),
	updateGrowingZone: vi.fn(),
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
		logger: createNoopLogger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	serverAction: (handlers: unknown[]) => {
		capturedChain.handlers = handlers;
		return Array.isArray(handlers) ? handlers[handlers.length - 1] : handlers;
	},
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { randomUUID } from 'node:crypto';
import { requireAuthentication } from '@/interrupters';
import { createGrowingZone, updateGrowingZone } from '@/repositories';
import { _saveGrowingZone } from '../growing-zone';

const VALID_FORM_DATA = {
	code: 'us_pacific_coast',
	name: 'US Pacific Coast',
} as const;

const MOCK_ZONE = {
	id: randomUUID(),
	code: 'us_pacific_coast',
	name: 'US Pacific Coast',
	createdAt: new Date().toISOString(),
	createdBy: 'test-user-id',
	updatedAt: null,
	updatedBy: null,
	deletedAt: null,
	deletedBy: null,
};

describe('saveGrowingZone', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockEnv.REZEPT_ENV = 'development';

		vi.mocked(createGrowingZone).mockResolvedValue(MOCK_ZONE as never);
		vi.mocked(updateGrowingZone).mockResolvedValue({
			...MOCK_ZONE,
			updatedAt: new Date().toISOString(),
			updatedBy: 'test-user-id',
		} as never);
	});

	describe('middleware chain', () => {
		it('includes requireAuthentication in the serverAction chain', () => {
			expect(capturedChain.handlers).toContain(requireAuthentication);
		});

		it('includes a requirePermissions handler in the chain', () => {
			const nonTerminal = capturedChain.handlers.slice(0, -1);
			expect(nonTerminal.length).toBeGreaterThanOrEqual(2);
			expect(nonTerminal.some(h => typeof h === 'function')).toBe(true);
		});
	});

	describe('create', () => {
		it('creates a zone with valid data', async () => {
			const result = await _saveGrowingZone(VALID_FORM_DATA);

			expect(result.success).toBe(true);
			expect(createGrowingZone).toHaveBeenCalledTimes(1);
			expect(createGrowingZone).toHaveBeenCalledWith(
				expect.objectContaining({ code: 'us_pacific_coast', name: 'US Pacific Coast' }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('returns the created zone', async () => {
			const result = await _saveGrowingZone(VALID_FORM_DATA);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(MOCK_ZONE);
		});

		it('does not call updateGrowingZone on create', async () => {
			await _saveGrowingZone(VALID_FORM_DATA);
			expect(updateGrowingZone).not.toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('calls updateGrowingZone when id is provided', async () => {
			const zoneId = randomUUID();
			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, id: zoneId });

			expect(result.success).toBe(true);
			expect(updateGrowingZone).toHaveBeenCalledTimes(1);
			expect(updateGrowingZone).toHaveBeenCalledWith(
				zoneId,
				expect.objectContaining({ code: 'us_pacific_coast', name: 'US Pacific Coast' }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('does not call createGrowingZone on update', async () => {
			await _saveGrowingZone({ ...VALID_FORM_DATA, id: randomUUID() });
			expect(createGrowingZone).not.toHaveBeenCalled();
		});
	});

	describe('validation', () => {
		it('returns error when code is missing', async () => {
			const { code: _omit, ...data } = VALID_FORM_DATA;
			const result = await _saveGrowingZone(data as never);

			expect(result.success).toBe(false);
			expect(result.errors?.code).toBeDefined();
			expect(createGrowingZone).not.toHaveBeenCalled();
		});

		it('returns error when code contains uppercase letters', async () => {
			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, code: 'US_Pacific' });

			expect(result.success).toBe(false);
			expect(result.errors?.code).toBeDefined();
			expect(createGrowingZone).not.toHaveBeenCalled();
		});

		it('returns error when code contains digits', async () => {
			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, code: 'zone1' });

			expect(result.success).toBe(false);
			expect(result.errors?.code).toBeDefined();
		});

		it('returns error when code contains hyphens', async () => {
			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, code: 'us-west' });

			expect(result.success).toBe(false);
			expect(result.errors?.code).toBeDefined();
		});

		it('returns error when code is empty', async () => {
			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, code: '' });

			expect(result.success).toBe(false);
			expect(result.errors?.code).toBeDefined();
		});

		it('returns error when name is missing', async () => {
			const { name: _omit, ...data } = VALID_FORM_DATA;
			const result = await _saveGrowingZone(data as never);

			expect(result.success).toBe(false);
			expect(result.errors?.name).toBeDefined();
			expect(createGrowingZone).not.toHaveBeenCalled();
		});

		it('returns error when name is empty', async () => {
			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, name: '' });

			expect(result.success).toBe(false);
			expect(result.errors?.name).toBeDefined();
		});

		it('returns error when provided id is not a valid UUID', async () => {
			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, id: 'not-a-uuid' });

			expect(result.success).toBe(false);
			expect(result.errors?.id).toBeDefined();
		});

		it('returns 400 code on validation error', async () => {
			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, code: '' });

			expect(result.code).toBe(400);
		});
	});

	describe('error handling', () => {
		it('returns error response when createGrowingZone throws', async () => {
			vi.mocked(createGrowingZone).mockRejectedValueOnce(new Error('DB error'));

			const result = await _saveGrowingZone(VALID_FORM_DATA);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns error response when updateGrowingZone throws', async () => {
			vi.mocked(updateGrowingZone).mockRejectedValueOnce(new Error('DB error'));

			const result = await _saveGrowingZone({ ...VALID_FORM_DATA, id: randomUUID() });

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns 500 code when repository throws', async () => {
			vi.mocked(createGrowingZone).mockRejectedValueOnce(new Error('DB error'));

			const result = await _saveGrowingZone(VALID_FORM_DATA);

			expect(result.code).toBe(500);
		});

		it('surfaces the raw error message in dev mode', async () => {
			vi.mocked(createGrowingZone).mockRejectedValueOnce(new Error('DB error'));
			mockEnv.REZEPT_ENV = 'development';

			const result = await _saveGrowingZone(VALID_FORM_DATA);

			expect(result.errors?._form?.[0]).toBe('DB error');
		});

		it('returns only the static message in production (no internal detail)', async () => {
			vi.mocked(createGrowingZone).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));
			mockEnv.REZEPT_ENV = 'production';

			const result = await _saveGrowingZone(VALID_FORM_DATA);

			expect(result.errors?._form?.[0]).toBe('Failed to save growing zone');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});
	});
});
