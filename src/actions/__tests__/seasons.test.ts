import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';

// Mock repositories
vi.mock('@/repositories/seasons', () => ({
	createSeason: vi.fn(),
	updateSeason: vi.fn(),
}));

// Mock env
vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_ENV: 'test' },
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
		logger: RzLogger;
	};
}

// Mock rwsdk/worker
const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: {
			id: 'test-user-id',
		},
		logger: new Logger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { randomUUID } from 'node:crypto';
import { createSeason, updateSeason } from '@/repositories/seasons';
import type { SeasonFormSave } from '@/types';
import { saveSeason } from '../seasons';

describe('saveSeason', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };

		// Set default mock returns
		vi.mocked(createSeason).mockResolvedValue({ id: 'mock-season-id' } as any);
		vi.mocked(updateSeason).mockResolvedValue({ id: 'mock-season-id' } as any);
	});

	describe('authentication', () => {
		it('rejects unauthenticated requests', async () => {
			mockRequestInfo.ctx.user = null;

			const data = {
				name: 'Test Season',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toContain('You must be logged in');
			expect(createSeason).not.toHaveBeenCalled();
		});
	});

	describe('create season', () => {
		it('creates season with valid data', async () => {
			const data = {
				name: 'Spring Season',
				country: 'US',
				startMonth: 3,
				endMonth: 5,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(true);
			expect(createSeason).toHaveBeenCalledTimes(1);
			expect(createSeason).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Spring Season',
					country: 'US',
					startMonth: 3,
					endMonth: 5,
				}),
				'test-user-id',
			);
		});

		it('validates required fields', async () => {
			const data = {} as SeasonFormSave;

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(createSeason).not.toHaveBeenCalled();
		});

		it('validates country code format', async () => {
			const data = {
				name: 'Test',
				country: 'USA', // Must be 2 letters
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.errors?.country).toBeDefined();
		});

		it('validates invalid country code', async () => {
			const data = {
				name: 'Test',
				country: 'ZZ', // Not a real country
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.errors?.country).toBeDefined();
		});

		it('validates month range minimum', async () => {
			const data = {
				name: 'Test',
				country: 'US',
				startMonth: 0, // Too low
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.errors?.startMonth).toBeDefined();
		});

		it('validates month range maximum', async () => {
			const data = {
				name: 'Test',
				country: 'US',
				startMonth: 1,
				endMonth: 13, // Too high
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.errors?.endMonth).toBeDefined();
		});

		it('handles repository errors gracefully', async () => {
			vi.mocked(createSeason).mockRejectedValueOnce(new Error('Database error'));

			const data = {
				name: 'Test',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
			expect(result.errors?._form?.[0]).toContain('Failed to save season');
		});

		it('accepts optional fields', async () => {
			const data = {
				name: 'Minimal Season',
				country: 'CA',
				startMonth: 6,
				endMonth: 8,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(true);
		});

		it('accepts season with all optional fields', async () => {
			const data = {
				name: 'Full Season',
				country: 'FR',
				region: 'Provence',
				startMonth: 4,
				endMonth: 6,
				description: 'Spring in Provence',
				notes: 'Great for lavender',
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(true);
			expect(createSeason).toHaveBeenCalledWith(
				expect.objectContaining({
					description: 'Spring in Provence',
					region: 'Provence',
					notes: 'Great for lavender',
				}),
				'test-user-id',
			);
		});

		it('hides error details in production', async () => {
			vi.mocked(createSeason).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));

			const data = {
				name: 'Test',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.errors?._form?.[0]).toBe('Failed to save season');
			expect(result.errors?._form?.[0]).not.toContain('postgres://');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});
	});

	describe('update season', () => {
		it('updates season with valid data', async () => {
			const seasonId = randomUUID();
			const data = {
				id: seasonId,
				name: 'Updated Season',
				country: 'CA',
				startMonth: 6,
				endMonth: 8,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(true);
			expect(updateSeason).toHaveBeenCalledTimes(1);
			expect(updateSeason).toHaveBeenCalledWith(
				seasonId,
				expect.objectContaining({
					name: 'Updated Season',
					country: 'CA',
					startMonth: 6,
					endMonth: 8,
				}),
				'test-user-id',
			);
		});

		it('handles update repository errors', async () => {
			vi.mocked(updateSeason).mockRejectedValueOnce(new Error('Update failed'));

			const data = {
				id: randomUUID(),
				name: 'Test',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});
	});
});
