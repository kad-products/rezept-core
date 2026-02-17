import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TestableDB } from '@/types';

let testDb: TestableDB;

vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_ENV: 'test' },
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
	};
}

const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: { id: 'test-user-id' },
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
}));

vi.mock('@/db', () => ({
	get default() {
		return testDb; // Returns current testDb
	},
}));

import { seasons } from '@/models';
import { getSeasonById } from '@/repositories/seasons';
import { createUser } from '@/repositories/users';
import { createTestDb } from '../../../tests/setup';
import { saveSeason } from '../seasons';

describe('saveSeason integration', () => {
	let testUserId: string;

	beforeEach(async () => {
		testDb = await createTestDb(); // Fresh db assigned to testDb

		const user = await createUser('testuser', testDb);
		testUserId = user.id;
		mockRequestInfo.ctx.user = { id: testUserId };

		vi.clearAllMocks();
	});

	describe('create season', () => {
		it('creates season and persists to database', async () => {
			const formData = new FormData();
			formData.set('name', 'Spring Season');
			formData.set('country', 'US');
			formData.set('startMonth', '3');
			formData.set('endMonth', '5');
			formData.set('createdBy', testUserId);

			const result = await saveSeason(null, formData);

			expect(result.success).toBe(true);
			expect(result.data?.id).toBeDefined();

			// Verify it's actually in the database
			if (result.data?.id) {
				const season = await getSeasonById(result.data.id);
				expect(season).toBeDefined();
				expect(season?.name).toBe('Spring Season');
				expect(season?.country).toBe('US');
				expect(season?.startMonth).toBe(3);
				expect(season?.endMonth).toBe(5);
				expect(season?.createdBy).toBe(testUserId);
			}
		});

		it('validates data before saving', async () => {
			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'INVALID');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('createdBy', testUserId);

			const result = await saveSeason(null, formData);

			expect(result.success).toBe(false);
			expect(result.data).toBeUndefined();

			// Verify nothing was saved to database
			const seasonData = await testDb.select().from(seasons);
			expect(seasonData).toHaveLength(0);
		});

		it('saves season with all optional fields', async () => {
			const formData = new FormData();
			formData.set('name', 'Full Season');
			formData.set('country', 'FR');
			formData.set('region', 'Provence');
			formData.set('description', 'Spring season');
			formData.set('notes', 'Great for lavender');
			formData.set('startMonth', '4');
			formData.set('endMonth', '6');
			formData.set('createdBy', testUserId);

			const result = await saveSeason(null, formData);

			expect(result.success).toBe(true);
			expect(result.data?.id).toBeDefined();

			if (result.data?.id) {
				const season = await getSeasonById(result.data.id);
				expect(season?.region).toBe('Provence');
				expect(season?.description).toBe('Spring season');
				expect(season?.notes).toBe('Great for lavender');
			}
		});

		it('sets audit fields correctly', async () => {
			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('createdBy', testUserId);

			const result = await saveSeason(null, formData);

			expect(result.success).toBe(true);
			expect(result.data?.id).toBeDefined();

			if (result.data?.id) {
				const season = await getSeasonById(result.data.id);
				expect(season?.createdBy).toBe(testUserId);
				expect(season?.createdAt).toBeDefined();
				expect(season?.updatedAt).toBeNull();
				expect(season?.deletedAt).toBeNull();
			}
		});

		it('requires authentication', async () => {
			mockRequestInfo.ctx.user = null;

			const formData = new FormData();
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('createdBy', testUserId);

			const result = await saveSeason(null, formData);

			expect(result.success).toBe(false);

			// Verify nothing was saved
			const seasonData = await testDb.select().from(seasons);
			expect(seasonData).toHaveLength(0);
		});
	});

	describe('update season', () => {
		it('updates existing season in database', async () => {
			// First create a season
			const createFormData = new FormData();
			createFormData.set('name', 'Original Name');
			createFormData.set('country', 'US');
			createFormData.set('startMonth', '1');
			createFormData.set('endMonth', '3');
			createFormData.set('createdBy', testUserId);

			const createResult = await saveSeason(null, createFormData);

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const seasonId = createResult.data.id;

				// Now update it
				const updateFormData = new FormData();
				updateFormData.set('id', seasonId);
				updateFormData.set('name', 'Updated Name');
				updateFormData.set('country', 'CA');
				updateFormData.set('startMonth', '6');
				updateFormData.set('endMonth', '8');
				updateFormData.set('updatedBy', testUserId);

				const updateResult = await saveSeason(null, updateFormData);

				expect(updateResult.success).toBe(true);
				expect(updateResult.data?.id).toBe(seasonId);

				// Verify the update persisted
				const season = await getSeasonById(seasonId);
				expect(season?.name).toBe('Updated Name');
				expect(season?.country).toBe('CA');
				expect(season?.startMonth).toBe(6);
				expect(season?.endMonth).toBe(8);
			}
		});
		it('updates audit fields on update', async () => {
			// Create
			const createFormData = new FormData();
			createFormData.set('name', 'Original');
			createFormData.set('country', 'US');
			createFormData.set('startMonth', '1');
			createFormData.set('endMonth', '3');
			createFormData.set('createdBy', testUserId);

			const createResult = await saveSeason(null, createFormData);

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const seasonId = createResult.data.id;

				// Wait to ensure different timestamp
				await new Promise(resolve => setTimeout(resolve, 10));

				// Update
				const updateFormData = new FormData();
				updateFormData.set('id', seasonId);
				updateFormData.set('name', 'Updated');
				updateFormData.set('country', 'CA');
				updateFormData.set('startMonth', '1');
				updateFormData.set('endMonth', '3');
				updateFormData.set('updatedBy', testUserId);

				await saveSeason(null, updateFormData);

				const season = await getSeasonById(seasonId);
				expect(season?.createdBy).toBe(testUserId);
				expect(season?.updatedBy).toBe(testUserId);
				expect(season?.updatedAt).toBeDefined();
				expect(season?.updatedAt).not.toBe(season?.createdAt);
			}
		});

		it('prevents updating non-existent season', async () => {
			const formData = new FormData();
			formData.set('id', crypto.randomUUID());
			formData.set('name', 'Test');
			formData.set('country', 'US');
			formData.set('startMonth', '1');
			formData.set('endMonth', '3');
			formData.set('updatedBy', testUserId);

			const result = await saveSeason(null, formData);

			// Should fail - season doesn't exist
			expect(result.success).toBe(false);
		});

		it('preserves fields not being updated', async () => {
			// Create with description
			const createFormData = new FormData();
			createFormData.set('name', 'Original');
			createFormData.set('description', 'Original description');
			createFormData.set('country', 'US');
			createFormData.set('startMonth', '1');
			createFormData.set('endMonth', '3');
			createFormData.set('createdBy', testUserId);

			const createResult = await saveSeason(null, createFormData);

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const seasonId = createResult.data.id;

				// Update only name, omit description
				const updateFormData = new FormData();
				updateFormData.set('id', seasonId);
				updateFormData.set('name', 'Updated Name');
				updateFormData.set('country', 'US');
				updateFormData.set('startMonth', '1');
				updateFormData.set('endMonth', '3');
				updateFormData.set('updatedBy', testUserId);

				await saveSeason(null, updateFormData);

				const season = await getSeasonById(seasonId);
				expect(season?.name).toBe('Updated Name');
				expect(season?.description).toBe('Original description');
			}
		});
	});

	describe('data integrity', () => {
		it('handles concurrent creates', async () => {
			// Create multiple seasons simultaneously
			const promises = Array.from({ length: 5 }, (_, i) => {
				const formData = new FormData();
				formData.set('name', `Season ${i}`);
				formData.set('country', 'US');
				formData.set('startMonth', '1');
				formData.set('endMonth', '3');
				formData.set('createdBy', testUserId);

				return saveSeason(null, formData);
			});

			const results = await Promise.all(promises);

			// All should succeed
			expect(results.every(r => r.success)).toBe(true);

			// All should have unique IDs
			const ids = results.map(r => r.data?.id).filter(Boolean);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(5);
		});
	});
});
