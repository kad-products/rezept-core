import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createGrowingZone, createIngredient, createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import {
	createIngredientSeason,
	deleteIngredientSeason,
	getIngredientSeasons,
	getIngredientSeasonsByIngredientIds,
	updateIngredientSeason,
	verifyIngredientSeason,
} from '../ingredient-seasons';

const logger = createNoopLogger();

const VALID_SEASON = {
	startMonth: 6,
	endMonth: 8,
} as const;

describe('ingredient seasons repository', () => {
	let testUserId: string;
	let testIngredientId: string;
	let testGrowingZoneId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
		const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
		testIngredientId = ingredient.id;
		const growingZone = await createGrowingZone(
			{ name: 'US Pacific Northwest', code: 'us_pacific_northwest' },
			testUserId,
			logger,
		);
		testGrowingZoneId = growingZone.id;
	});

	describe('getIngredientSeasons', () => {
		it('returns empty array when ingredient has no seasons', async () => {
			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toEqual([]);
		});

		it('returns all seasons for the ingredient', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			const otherGrowingZone = await createGrowingZone({ name: 'US Gulf Coast', code: 'us_gulf_coast' }, testUserId, logger);
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: otherGrowingZone.id, startMonth: 3, endMonth: 9 },
				testUserId,
				logger,
			);

			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toHaveLength(2);
		});

		it('does not return seasons belonging to other ingredients', async () => {
			const other = await createIngredient({ name: 'Onion' }, testUserId, logger);
			await createIngredientSeason(
				{ ingredientId: other.id, ...VALID_SEASON, growingZoneId: testGrowingZoneId },
				testUserId,
				logger,
			);

			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toEqual([]);
		});

		it('excludes soft-deleted seasons', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, ...VALID_SEASON, growingZoneId: testGrowingZoneId },
				testUserId,
				logger,
			);
			await deleteIngredientSeason(season.id, testUserId, logger);

			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toEqual([]);
		});

		it('returns remaining seasons after one is deleted', async () => {
			const keep = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			const otherGrowingZone = await createGrowingZone({ name: 'US Gulf Coast', code: 'us_gulf_coast' }, testUserId, logger);
			const remove = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: otherGrowingZone.id, startMonth: 3, endMonth: 9 },
				testUserId,
				logger,
			);
			await deleteIngredientSeason(remove.id, testUserId, logger);

			const result = await getIngredientSeasons(testIngredientId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(keep.id);
		});
	});

	describe('getIngredientSeasonsByIngredientIds', () => {
		it('returns empty array when ingredientIds is empty', async () => {
			const result = await getIngredientSeasonsByIngredientIds([], testGrowingZoneId, logger);
			expect(result).toEqual([]);
		});

		it('returns matching seasons for the given ingredientId and growingZoneId', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);

			const result = await getIngredientSeasonsByIngredientIds([testIngredientId], testGrowingZoneId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].ingredientId).toBe(testIngredientId);
			expect(result[0].growingZoneId).toBe(testGrowingZoneId);
		});

		it('does not return seasons for a different growingZoneId', async () => {
			const otherZone = await createGrowingZone({ name: 'US Gulf Coast', code: 'us_gulf_coast' }, testUserId, logger);
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: otherZone.id, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);

			const result = await getIngredientSeasonsByIngredientIds([testIngredientId], testGrowingZoneId, logger);
			expect(result).toEqual([]);
		});

		it('returns seasons for multiple ingredientIds', async () => {
			const otherIngredient = await createIngredient({ name: 'Onion' }, testUserId, logger);
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			await createIngredientSeason(
				{ ingredientId: otherIngredient.id, growingZoneId: testGrowingZoneId, startMonth: 3, endMonth: 5 },
				testUserId,
				logger,
			);

			const result = await getIngredientSeasonsByIngredientIds([testIngredientId, otherIngredient.id], testGrowingZoneId, logger);
			expect(result).toHaveLength(2);
		});

		it('does not return soft-deleted seasons', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			await deleteIngredientSeason(season.id, testUserId, logger);

			const result = await getIngredientSeasonsByIngredientIds([testIngredientId], testGrowingZoneId, logger);
			expect(result).toEqual([]);
		});

		it('handles batches larger than 100 ingredientIds without error', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			const ids = Array.from({ length: 105 }, (_, i) => randomUUID());
			ids.push(testIngredientId);

			const result = await getIngredientSeasonsByIngredientIds(ids, testGrowingZoneId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].ingredientId).toBe(testIngredientId);
		});
	});

	describe('createIngredientSeason', () => {
		it('creates a season with required fields', async () => {
			const result = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			expect(result.id).toBeDefined();
			expect(result.ingredientId).toBe(testIngredientId);
			expect(result.growingZoneId).toBe(testGrowingZoneId);
			expect(result.startMonth).toBe(6);
			expect(result.endMonth).toBe(8);
		});

		it('sets createdBy to userId', async () => {
			const result = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			expect(result.createdBy).toBe(testUserId);
		});

		it('sets audit fields correctly on create', async () => {
			const result = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates season with optional notes', async () => {
			const result = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON, notes: 'Peak ripeness in July' },
				testUserId,
				logger,
			);
			expect(result.notes).toBe('Peak ripeness in July');
		});

		it('throws on duplicate ingredient + growing zone', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);
			await expect(
				createIngredientSeason(
					{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 3, endMonth: 5 },
					testUserId,
					logger,
				),
			).rejects.toThrow();
		});

		it('allows same growing zone across different ingredients', async () => {
			const other = await createIngredient({ name: 'Onion' }, testUserId, logger);
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			await expect(
				createIngredientSeason({ ingredientId: other.id, growingZoneId: testGrowingZoneId, ...VALID_SEASON }, testUserId, logger),
			).resolves.toBeDefined();
		});

		it('allows wrap-around month range (startMonth > endMonth)', async () => {
			const result = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 11, endMonth: 2 },
				testUserId,
				logger,
			);
			expect(result.startMonth).toBe(11);
			expect(result.endMonth).toBe(2);
		});

		it('throws InvalidUUID for non-UUID id', async () => {
			await expect(
				createIngredientSeason(
					{ id: 'not-a-uuid', ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
					testUserId,
					logger,
				),
			).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a Ingredient Season');
		});

		it('throws InvalidUUID for non-UUID ingredient id', async () => {
			await expect(
				createIngredientSeason(
					{ ingredientId: 'not-a-uuid', growingZoneId: testGrowingZoneId, ...VALID_SEASON },
					testUserId,
					logger,
				),
			).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a Ingredient');
		});

		it('throws InvalidUUID for empty string ingredient id', async () => {
			await expect(
				createIngredientSeason({ ingredientId: '', growingZoneId: testGrowingZoneId, ...VALID_SEASON }, testUserId, logger),
			).rejects.toThrow('The value "" is not a valid ID for a Ingredient');
		});
	});

	describe('updateIngredientSeason', () => {
		it('updates month fields', async () => {
			const created = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			const result = await updateIngredientSeason(
				created.id,
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 4, endMonth: 10 },
				testUserId,
				logger,
			);

			expect(result.startMonth).toBe(4);
			expect(result.endMonth).toBe(10);
		});

		it('sets updatedBy and updatedAt', async () => {
			const created = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			const result = await updateIngredientSeason(
				created.id,
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			expect(result.updatedBy).toBe(testUserId);
			expect(result.updatedAt).not.toBeNull();
		});

		it('returns the updated record with the same id', async () => {
			const created = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			const result = await updateIngredientSeason(
				created.id,
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			expect(result.id).toBe(created.id);
		});

		it('throws UnexpectedRecordCount when id does not exist', async () => {
			await expect(
				updateIngredientSeason(
					crypto.randomUUID(),
					{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
					testUserId,
					logger,
				),
			).rejects.toThrow('Expected 1 Ingredient Season record(s), but found 0');
		});

		it('does not affect other seasons', async () => {
			const other = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 3, endMonth: 9 },
				testUserId,
				logger,
			);
			const otherGrowingZone = await createGrowingZone({ name: 'US Gulf Coast', code: 'us_gulf_coast' }, testUserId, logger);
			const target = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: otherGrowingZone.id, startMonth: 6, endMonth: 8 },
				testUserId,
				logger,
			);

			await updateIngredientSeason(
				target.id,
				{ ingredientId: testIngredientId, growingZoneId: otherGrowingZone.id, startMonth: 5, endMonth: 9 },
				testUserId,
				logger,
			);

			const seasons = await getIngredientSeasons(testIngredientId, logger);
			const unchanged = seasons.find(s => s.id === other.id);
			expect(unchanged?.updatedAt).toBeNull();
		});

		it('throws InvalidUUID for non-UUID id', async () => {
			await expect(
				updateIngredientSeason(
					'not-a-uuid',
					{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
					testUserId,
					logger,
				),
			).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a Ingredient Season');
		});

		it('throws InvalidUUID for empty string id', async () => {
			await expect(
				updateIngredientSeason(
					'',
					{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
					testUserId,
					logger,
				),
			).rejects.toThrow('The value "" is not a valid ID for a Ingredient Season');
		});
	});

	describe('deleteIngredientSeason', () => {
		it('soft-deletes the season', async () => {
			const created = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			const result = await deleteIngredientSeason(created.id, testUserId, logger);

			expect(result.deletedAt).not.toBeNull();
			expect(result.deletedBy).toBe(testUserId);
		});

		it('returns the deleted record', async () => {
			const created = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

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
			const created = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			await deleteIngredientSeason(created.id, testUserId, logger);

			const seasons = await getIngredientSeasons(testIngredientId, logger);
			expect(seasons.find(s => s.id === created.id)).toBeUndefined();
		});
	});

	describe('verifyIngredientSeason', () => {
		it('returns a verification record and the updated season', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			const result = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(result.verification).toBeDefined();
			expect(result.ingredientSeason).toBeDefined();
		});

		it('sets ingredientSeasonId on the verification record', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			const { verification } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(verification.ingredientSeasonId).toBe(season.id);
		});

		it('sets createdBy on the verification record', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			const { verification } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(verification.createdBy).toBe(testUserId);
		});

		it('includes parent ingredientId on the verification record', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			const { verification } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(verification.ingredientId).toBe(testIngredientId);
		});

		it('updates lastVerifiedAt on the season', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			expect(season.lastVerifiedAt).toBeNull();

			const { ingredientSeason: updated } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(updated.lastVerifiedAt).not.toBeNull();
		});

		it('sets lastVerifiedAt to match the verification createdAt', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			const { ingredientSeason: updated, verification } = await verifyIngredientSeason(
				season.id,
				testIngredientId,
				testUserId,
				logger,
			);

			expect(updated.lastVerifiedAt).toBe(verification.createdAt);
		});

		it('sets updatedAt to match the verification createdAt', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			const { ingredientSeason: updated, verification } = await verifyIngredientSeason(
				season.id,
				testIngredientId,
				testUserId,
				logger,
			);

			expect(updated.updatedAt).toBe(verification.createdAt);
		});

		it('sets updatedBy on the season', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			const { ingredientSeason: updated } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(updated.updatedBy).toBe(testUserId);
		});

		it('returns the correct season id', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);
			const { ingredientSeason: updated } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(updated.id).toBe(season.id);
		});

		it('does not update other seasons', async () => {
			const other = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: 3, endMonth: 9 },
				testUserId,
				logger,
			);
			const otherGrowingZone = await createGrowingZone({ name: 'US Gulf Coast', code: 'us_gulf_coast' }, testUserId, logger);
			const target = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: otherGrowingZone.id, ...VALID_SEASON },
				testUserId,
				logger,
			);

			await verifyIngredientSeason(target.id, testIngredientId, testUserId, logger);

			const seasons = await getIngredientSeasons(testIngredientId, logger);
			const unchanged = seasons.find(s => s.id === other.id);
			expect(unchanged?.lastVerifiedAt).toBeNull();
			expect(unchanged?.updatedAt).toBeNull();
		});

		it('allows multiple verifications for the same season', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			const { verification: first } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);
			const { verification: second } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(first.id).not.toBe(second.id);
			expect(second.ingredientSeasonId).toBe(season.id);
		});

		it('updates lastVerifiedAt on re-verification', async () => {
			const season = await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, ...VALID_SEASON },
				testUserId,
				logger,
			);

			const { ingredientSeason: afterFirst } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);
			const { ingredientSeason: afterSecond } = await verifyIngredientSeason(season.id, testIngredientId, testUserId, logger);

			expect(afterFirst.lastVerifiedAt).not.toBeNull();
			expect(afterSecond.lastVerifiedAt).not.toBeNull();
		});

		it('throws InvalidUUID for a non-UUID id', async () => {
			await expect(verifyIngredientSeason('not-a-uuid', testIngredientId, testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Ingredient Season',
			);
		});

		it('throws InvalidUUID for a non-UUID ingredient id', async () => {
			await expect(verifyIngredientSeason(testIngredientId, 'not-a-uuid', testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Ingredient',
			);
		});

		it('throws InvalidUUID for an empty string id', async () => {
			await expect(verifyIngredientSeason('', testIngredientId, testUserId, logger)).rejects.toThrow(
				'The value "" is not a valid ID for a Ingredient Season',
			);
		});

		it('throws when the season does not exist', async () => {
			await expect(verifyIngredientSeason(randomUUID(), testIngredientId, testUserId, logger)).rejects.toThrow();
		});
	});
});
