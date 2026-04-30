import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createSeason, getSeasonById, getSeasons, updateSeason } from '../seasons';

const logger = new Logger();

const baseSeasonData = {
	name: 'Spring Season',
	country: 'US',
	startMonth: 3,
	endMonth: 5,
};

describe('seasons repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', logger);
		testUserId = user.id;
	});

	describe('getSeasons', () => {
		it('returns empty array when no seasons exist', async () => {
			const result = await getSeasons(logger);
			expect(result).toEqual([]);
		});

		it('returns all seasons', async () => {
			await createSeason({ ...baseSeasonData, name: 'Season 1' }, testUserId, logger);
			await createSeason({ ...baseSeasonData, name: 'Season 2' }, testUserId, logger);
			await createSeason({ ...baseSeasonData, name: 'Season 3' }, testUserId, logger);

			const result = await getSeasons(logger);
			expect(result).toHaveLength(3);
		});

		it('returns seasons with correct shape', async () => {
			await createSeason(baseSeasonData, testUserId, logger);

			const result = await getSeasons(logger);
			expect(result[0]).toMatchObject({
				name: 'Spring Season',
				country: 'US',
				startMonth: 3,
				endMonth: 5,
				createdBy: testUserId,
			});
		});
	});

	describe('getSeasonById', () => {
		it('returns season by id', async () => {
			const created = await createSeason(baseSeasonData, testUserId, logger);

			const result = await getSeasonById(created.id, logger);
			expect(result.id).toBe(created.id);
			expect(result.name).toBe('Spring Season');
		});

		it('throws when season does not exist', async () => {
			await expect(getSeasonById(crypto.randomUUID(), logger)).rejects.toThrow('matchedSeasons length is 0');
		});

		it('returns correct season when multiple exist', async () => {
			await createSeason({ ...baseSeasonData, name: 'Season 1' }, testUserId, logger);
			const season2 = await createSeason({ ...baseSeasonData, name: 'Season 2' }, testUserId, logger);

			const result = await getSeasonById(season2.id, logger);
			expect(result.id).toBe(season2.id);
			expect(result.name).toBe('Season 2');
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(getSeasonById('not-a-uuid', logger)).rejects.toThrow('Invalid id: not-a-uuid');
		});

		it('throws when id is an empty string', async () => {
			await expect(getSeasonById('', logger)).rejects.toThrow('Invalid id: ');
		});

		it('throws when id contains special characters', async () => {
			await expect(getSeasonById('<Anonymous code>', logger)).rejects.toThrow('Invalid id: <Anonymous code>');
		});
	});

	describe('createSeason', () => {
		it('creates a season with required fields', async () => {
			const result = await createSeason(baseSeasonData, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.name).toBe('Spring Season');
			expect(result.country).toBe('US');
			expect(result.startMonth).toBe(3);
			expect(result.endMonth).toBe(5);
		});

		it('sets createdBy to userId', async () => {
			const result = await createSeason(baseSeasonData, testUserId, logger);
			expect(result.createdBy).toBe(testUserId);
		});

		it('sets audit fields correctly', async () => {
			const result = await createSeason(baseSeasonData, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates season with optional fields', async () => {
			const result = await createSeason(
				{
					...baseSeasonData,
					region: 'Midwest',
					description: 'A spring season',
					notes: 'Some notes',
				},
				testUserId,
				logger,
			);

			expect(result.region).toBe('Midwest');
			expect(result.description).toBe('A spring season');
			expect(result.notes).toBe('Some notes');
		});

		it('creates multiple seasons with unique ids', async () => {
			const season1 = await createSeason({ ...baseSeasonData, name: 'Season 1' }, testUserId, logger);
			const season2 = await createSeason({ ...baseSeasonData, name: 'Season 2' }, testUserId, logger);

			expect(season1.id).not.toBe(season2.id);
		});
	});

	describe('updateSeason', () => {
		it('updates season fields', async () => {
			const created = await createSeason(baseSeasonData, testUserId, logger);

			const result = await updateSeason(
				created.id,
				{
					...baseSeasonData,
					name: 'Updated Name',
					country: 'CA',
				},
				testUserId,
				logger,
			);

			expect(result.name).toBe('Updated Name');
			expect(result.country).toBe('CA');
		});

		it('sets updatedBy to userId', async () => {
			const created = await createSeason(baseSeasonData, testUserId, logger);

			const result = await updateSeason(created.id, baseSeasonData, testUserId, logger);
			expect(result.updatedBy).toBe(testUserId);
		});

		it('sets updatedAt on update', async () => {
			const created = await createSeason(baseSeasonData, testUserId, logger);

			await new Promise(resolve => setTimeout(resolve, 10));

			const result = await updateSeason(created.id, baseSeasonData, testUserId, logger);
			expect(result.updatedAt).toBeDefined();
			expect(result.updatedAt).not.toBe(created.createdAt);
		});

		it('preserves fields not being updated', async () => {
			const created = await createSeason(
				{
					...baseSeasonData,
					description: 'Original description',
				},
				testUserId,
				logger,
			);

			const result = await updateSeason(created.id, baseSeasonData, testUserId, logger);
			expect(result.description).toBe('Original description');
		});

		it('returns undefined for non-existent season', async () => {
			const result = await updateSeason(crypto.randomUUID(), baseSeasonData, testUserId, logger);
			expect(result).toBeUndefined();
		});

		it('does not affect other seasons', async () => {
			const season1 = await createSeason({ ...baseSeasonData, name: 'Season 1' }, testUserId, logger);
			const season2 = await createSeason({ ...baseSeasonData, name: 'Season 2' }, testUserId, logger);

			await updateSeason(season1.id, { ...baseSeasonData, name: 'Updated' }, testUserId, logger);

			const unchanged = await getSeasonById(season2.id, logger);
			expect(unchanged.name).toBe('Season 2');
		});
	});
});
