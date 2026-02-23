import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';
import { getSeasonById, getSeasons } from '@/repositories/seasons';
import { createUser } from '@/repositories/users';
import { resetDb } from '../../../tests/mocks/db';
import { saveSeason } from '../seasons';

vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_ENV: 'test' },
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
	get requestInfo() {
		return mockRequestInfo;
	},
}));

describe('saveSeason integration', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser');
		testUserId = user.id;
		mockRequestInfo.ctx.user = { id: testUserId };

		vi.clearAllMocks();
	});

	describe('create season', () => {
		it('creates season and persists to database', async () => {
			const data = {
				name: 'Spring Season',
				country: 'US',
				startMonth: 3,
				endMonth: 5,
			};

			const result = await saveSeason(data);

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
			const data = {
				name: 'Test',
				country: 'INVALID',
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);
			expect(result.data).toBeUndefined();

			// Verify nothing was saved to database
			const seasonData = await getSeasons();
			expect(seasonData).toHaveLength(0);
		});

		it('saves season with all optional fields', async () => {
			const data = {
				name: 'Full Season',
				country: 'FR',
				region: 'Provence',
				description: 'Spring season',
				notes: 'Great for lavender',
				startMonth: 4,
				endMonth: 6,
			};

			const result = await saveSeason(data);

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
			const data = {
				name: 'Test',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

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

			const data = {
				name: 'Test',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const result = await saveSeason(data);

			expect(result.success).toBe(false);

			// Verify nothing was saved
			const seasonData = await getSeasons();
			expect(seasonData).toHaveLength(0);
		});
	});

	describe('update season', () => {
		it('updates existing season in database', async () => {
			// First create a season
			const createData = {
				name: 'Original Name',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const createResult = await saveSeason(createData);

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const seasonId = createResult.data.id;

				// Now update it
				const updateData = {
					id: seasonId,
					name: 'Updated Name',
					country: 'CA',
					startMonth: 6,
					endMonth: 8,
				};

				const updateResult = await saveSeason(updateData);

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
			const createData = {
				name: 'Original',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const createResult = await saveSeason(createData);

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const seasonId = createResult.data.id;

				// Wait to ensure different timestamp
				await new Promise(resolve => setTimeout(resolve, 10));

				// Update
				const updateData = {
					id: seasonId,
					name: 'Updated',
					country: 'CA',
					startMonth: 1,
					endMonth: 3,
				};

				await saveSeason(updateData);

				const season = await getSeasonById(seasonId);
				expect(season?.createdBy).toBe(testUserId);
				expect(season?.updatedBy).toBe(testUserId);
				expect(season?.updatedAt).toBeDefined();
				expect(season?.updatedAt).not.toBe(season?.createdAt);
			}
		});

		it('preserves fields not being updated', async () => {
			// Create with description
			const createData = {
				name: 'Original',
				description: 'Original description',
				country: 'US',
				startMonth: 1,
				endMonth: 3,
			};

			const createResult = await saveSeason(createData);

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const seasonId = createResult.data.id;

				// Update only name, omit description
				const updateData = {
					id: seasonId,
					name: 'Updated Name',
					country: 'US',
					startMonth: 1,
					endMonth: 3,
				};

				await saveSeason(updateData);

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
				const data = {
					name: `Season ${i}`,
					country: 'US',
					startMonth: 1,
					endMonth: 3,
				};

				return saveSeason(data);
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
