import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createIngredient, createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import {
	createIngredientSeason,
	deleteIngredientSeason,
	getIngredientSeasons,
	updateIngredientSeason,
} from '../ingredient-seasons';

const logger = createNoopLogger();

const VALID_SEASON = {
	country: 'USA',
	startMonth: 6,
	endMonth: 8,
} as const;

describe('ingredient seasons repository', () => {
	let testUserId: string;
	let testIngredientId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
		const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
		testIngredientId = ingredient.id;
	});

	describe('getIngredientSeasons', () => {
		it('returns empty array when ingredient has no seasons', async () => {
			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toEqual([]);
		});

		it('returns all seasons for the ingredient', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'USA', startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'GBR', startMonth: 3, endMonth: 9 },
				testUserId,
				logger,
			);

			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toHaveLength(2);
		});

		it('does not return seasons belonging to other ingredients', async () => {
			const other = await createIngredient({ name: 'Onion' }, testUserId, logger);
			await createIngredientSeason({ ingredientId: other.id, ...VALID_SEASON }, testUserId, logger);

			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toEqual([]);
		});

		it('excludes soft-deleted seasons', async () => {
			const season = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);
			await deleteIngredientSeason(season.id, testUserId, logger);

			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toEqual([]);
		});

		it('returns remaining seasons after one is deleted', async () => {
			const keep = await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'USA', startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			const remove = await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'GBR', startMonth: 3, endMonth: 9 },
				testUserId,
				logger,
			);
			await deleteIngredientSeason(remove.id, testUserId, logger);

			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(keep.id);
		});
	});

	describe('createIngredientSeason', () => {
		it('creates a season with required fields', async () => {
			const result = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.ingredientId).toBe(testIngredientId);
			expect(result.country).toBe('USA');
			expect(result.startMonth).toBe(6);
			expect(result.endMonth).toBe(8);
		});

		it('sets createdBy to userId', async () => {
			const result = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);
			expect(result.createdBy).toBe(testUserId);
		});

		it('sets audit fields correctly on create', async () => {
			const result = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates season with optional region', async () => {
			const result = await createIngredientSeason(
				{ ingredientId: testIngredientId, ...VALID_SEASON, region: 'California' },
				testUserId,
				logger,
			);
			expect(result.region).toBe('California');
		});

		it('creates season with optional notes', async () => {
			const result = await createIngredientSeason(
				{ ingredientId: testIngredientId, ...VALID_SEASON, notes: 'Peak ripeness in July' },
				testUserId,
				logger,
			);
			expect(result.notes).toBe('Peak ripeness in July');
		});

		it('throws on duplicate ingredient + country + region', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'USA', region: 'California', startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			await expect(
				createIngredientSeason(
					{ ingredientId: testIngredientId, country: 'USA', region: 'California', startMonth: 3, endMonth: 5 },
					testUserId,
					logger,
				),
			).rejects.toThrow();
		});

		it('allows same country across different ingredients', async () => {
			const other = await createIngredient({ name: 'Onion' }, testUserId, logger);
			await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);

			await expect(
				createIngredientSeason({ ingredientId: other.id, ...VALID_SEASON }, testUserId, logger),
			).resolves.toBeDefined();
		});

		it('allows same ingredient + country with different regions', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'USA', region: 'California', startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			await expect(
				createIngredientSeason(
					{ ingredientId: testIngredientId, country: 'USA', region: 'Texas', startMonth: 6, endMonth: 8 },
					testUserId,
					logger,
				),
			).resolves.toBeDefined();
		});

		it('allows wrap-around month range (startMonth > endMonth)', async () => {
			const result = await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'USA', startMonth: 11, endMonth: 2 },
				testUserId,
				logger,
			);
			expect(result.startMonth).toBe(11);
			expect(result.endMonth).toBe(2);
		});

		it('throws InvalidUUID for non-UUID id', async () => {
			await expect(
				createIngredientSeason(
					{ id: 'not-a-uuid', ingredientId: testIngredientId, ...VALID_SEASON, region: 'Oregon' },
					testUserId,
					logger,
				),
			).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a Ingredient Season');
		});

		it('throws InvalidUUID for non-UUID ingredient id', async () => {
			await expect(
				createIngredientSeason({ ingredientId: 'not-a-uuid', ...VALID_SEASON, region: 'Oregon' }, testUserId, logger),
			).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a Ingredient');
		});

		it('throws InvalidUUID for empty string ingredient id', async () => {
			await expect(
				createIngredientSeason({ ingredientId: '', ...VALID_SEASON, region: 'Oregon' }, testUserId, logger),
			).rejects.toThrow('The value "" is not a valid ID for a Ingredient');
		});
	});

	describe('updateIngredientSeason', () => {
		it('updates month fields', async () => {
			const created = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);

			const result = await updateIngredientSeason(
				created.id,
				{ ingredientId: testIngredientId, country: 'USA', startMonth: 4, endMonth: 10 },
				testUserId,
				logger,
			);

			expect(result.startMonth).toBe(4);
			expect(result.endMonth).toBe(10);
		});

		it('sets updatedBy and updatedAt', async () => {
			const created = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);

			const result = await updateIngredientSeason(
				created.id,
				{ ingredientId: testIngredientId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			expect(result.updatedBy).toBe(testUserId);
			expect(result.updatedAt).not.toBeNull();
		});

		it('returns the updated record with the same id', async () => {
			const created = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);

			const result = await updateIngredientSeason(
				created.id,
				{ ingredientId: testIngredientId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			expect(result.id).toBe(created.id);
		});

		it('throws UnexpectedRecordCount when id does not exist', async () => {
			await expect(
				updateIngredientSeason(crypto.randomUUID(), { ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger),
			).rejects.toThrow('Expected 1 Ingredient Season record(s), but found 0');
		});

		it('does not affect other seasons', async () => {
			const other = await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'GBR', startMonth: 3, endMonth: 9 },
				testUserId,
				logger,
			);
			const target = await createIngredientSeason(
				{ ingredientId: testIngredientId, country: 'USA', startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);

			await updateIngredientSeason(
				target.id,
				{ ingredientId: testIngredientId, country: 'USA', startMonth: 5, endMonth: 9 },
				testUserId,
				logger,
			);

			const seasons = await getIngredientSeasons(testIngredientId, logger);
			const unchanged = seasons.find(s => s.id === other.id);
			expect(unchanged?.updatedAt).toBeNull();
		});

		it('can update region', async () => {
			const created = await createIngredientSeason(
				{ ingredientId: testIngredientId, ...VALID_SEASON, region: 'California' },
				testUserId,
				logger,
			);

			const result = await updateIngredientSeason(
				created.id,
				{ ingredientId: testIngredientId, ...VALID_SEASON, region: 'Oregon' },
				testUserId,
				logger,
			);

			expect(result.region).toBe('Oregon');
		});

		it('throws InvalidUUID for non-UUID id', async () => {
			await expect(
				updateIngredientSeason(
					'not-a-uuid',
					{ ingredientId: testIngredientId, ...VALID_SEASON, region: 'Oregon' },
					testUserId,
					logger,
				),
			).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a Ingredient Season');
		});

		it('throws InvalidUUID for empty string id', async () => {
			await expect(
				updateIngredientSeason('', { ingredientId: testIngredientId, ...VALID_SEASON, region: 'Oregon' }, testUserId, logger),
			).rejects.toThrow('The value "" is not a valid ID for a Ingredient Season');
		});
	});

	describe('deleteIngredientSeason', () => {
		it('soft-deletes the season', async () => {
			const created = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);

			const result = await deleteIngredientSeason(created.id, testUserId, logger);

			expect(result.deletedAt).not.toBeNull();
			expect(result.deletedBy).toBe(testUserId);
		});

		it('returns the deleted record', async () => {
			const created = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);

			const result = await deleteIngredientSeason(created.id, testUserId, logger);
			expect(result.id).toBe(created.id);
		});

		it('throws InvalidUUID for non-UUID id', async () => {
			await expect(deleteIngredientSeason('not-a-uuid', testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Ingredient Season',
			);
		});

		it('throws InvalidUUID for empty string id', async () => {
			await expect(deleteIngredientSeason('', testUserId, logger)).rejects.toThrow(
				'The value "" is not a valid ID for a Ingredient Season',
			);
		});

		it('throws UnexpectedRecordCount for a valid UUID that does not exist', async () => {
			await expect(deleteIngredientSeason(crypto.randomUUID(), testUserId, logger)).rejects.toThrow(
				'Expected 1 Ingredient Season record(s), but found 0',
			);
		});

		it('deleted season no longer appears in getIngredientSeasons', async () => {
			const created = await createIngredientSeason({ ingredientId: testIngredientId, ...VALID_SEASON }, testUserId, logger);
			await deleteIngredientSeason(created.id, testUserId, logger);

			const seasons = await getIngredientSeasons(testIngredientId, logger);
			expect(seasons.find(s => s.id === created.id)).toBeUndefined();
		});
	});
});
