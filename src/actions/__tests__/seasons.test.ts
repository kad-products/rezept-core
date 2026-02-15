import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionState } from '@/types';

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
	};
}

// Mock rwsdk/worker - this is trickier, we'll set it up to be changeable
const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: {
			id: 'test-user-id',
		},
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { randomUUID } from 'node:crypto';
import { createSeason, updateSeason } from '@/repositories/seasons';
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

			const formData = new FormData();
			formData.set('name', 'Test Season');

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?._form).toContain('You must be logged in');
			expect(createSeason).not.toHaveBeenCalled();
		});
	});

	describe('create season', () => {
		it('creates season with valid data', async () => {
			const formData = new FormData();
			formData.set('name', 'Spring Season');
			formData.set('country', 'US');
			formData.set('startMonth', '3');
			formData.set('endMonth', '5');
			formData.set('createdBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(true);
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
			const formData = new FormData();
			// Missing name, country, months

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors).toBeDefined();
			expect(createSeason).not.toHaveBeenCalled();
		});

		it('validates country code format', async () => {
			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'USA'); // Must be 2 letters
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('createdBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?.country).toBeDefined();
		});

		it('validates invalid country code', async () => {
			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'ZZ'); // Not a real country
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('createdBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?.country).toBeDefined();
		});

		it('validates month range minimum', async () => {
			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '0'); // Too low
			formData.set('endMonth', '3');
			formData.set('createdBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?.startMonth).toBeDefined();
		});

		it('validates month range maximum', async () => {
			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '13'); // Too high
			formData.set('createdBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?.endMonth).toBeDefined();
		});

		it('validates createdBy is valid UUID', async () => {
			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('createdBy', 'not-a-uuid');

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?.createdBy).toBeDefined();
		});

		it('handles repository errors gracefully', async () => {
			vi.mocked(createSeason).mockRejectedValueOnce(new Error('Database error'));

			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('createdBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?._form).toBeDefined();
			expect(result?.errors?._form?.[0]).toContain('Failed to save season'); // Test env shows real error
		});

		it('accepts optional fields', async () => {
			const formData = new FormData();
			formData.set('name', 'Minimal Season');
			formData.set('country', 'CA');
			formData.set('startMonth', '6');
			formData.set('endMonth', '8');
			formData.set('createdBy', randomUUID());
			// No description, region, notes

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(true);
		});

		it('accepts season with all optional fields', async () => {
			const formData = new FormData();
			formData.set('name', 'Full Season');
			formData.set('country', 'FR');
			formData.set('region', 'Provence');
			formData.set('startMonth', '4');
			formData.set('endMonth', '6');
			formData.set('description', 'Spring in Provence');
			formData.set('notes', 'Great for lavender');
			formData.set('createdBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(true);
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
			// Simulate a database error with sensitive info
			vi.mocked(createSeason).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));

			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('createdBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			// Should NOT expose the real error
			expect(result?.errors?._form?.[0]).toBe('Failed to save season');
			expect(result?.errors?._form?.[0]).not.toContain('postgres://');
			expect(result?.errors?._form?.[0]).not.toContain('password');
		});
	});

	describe('update season', () => {
		it('updates season with valid data', async () => {
			const seasonId = randomUUID();
			const formData = new FormData();
			formData.set('id', seasonId);
			formData.set('name', 'Updated Season');
			formData.set('country', 'CA');
			formData.set('startMonth', '6');
			formData.set('endMonth', '8');
			formData.set('updatedBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(true);
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

		it('requires updatedBy for updates', async () => {
			const formData = new FormData();
			formData.set('id', randomUUID());
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			// Missing updatedBy

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?.updatedBy).toBeDefined();
		});

		it('handles update repository errors', async () => {
			vi.mocked(updateSeason).mockRejectedValueOnce(new Error('Update failed'));

			const formData = new FormData();
			formData.set('id', randomUUID());
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('updatedBy', randomUUID());

			const result = await saveSeason({} as ActionState, formData);

			expect(result?.success).toBe(false);
			expect(result?.errors?._form).toBeDefined();
		});
	});
});
