import { and, eq, isNull } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import db from '@/db';
import { createNoopLogger } from '@/logger';
import { seasonalIngredients } from '@/models';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createIngredient } from '../ingredients';
import { updateSeasonalIngredientsForSeason } from '../seasonal-ingredients';
import { createSeason } from '../seasons';

const logger = createNoopLogger();

const baseSeasonData = {
	name: 'Spring',
	country: 'US',
	startMonth: 3,
	endMonth: 5,
};

describe('seasonal-ingredients repository', () => {
	let testUserId: string;
	let testSeasonId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
		const season = await createSeason(baseSeasonData, testUserId, logger);
		testSeasonId = season.id;
	});

	describe('updateSeasonalIngredientsForSeason', () => {
		it('adds ingredients to a season', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id, onion.id], testUserId, logger);

			const result = await db.query.seasonalIngredients.findMany({
				where: and(eq(seasonalIngredients.seasonId, testSeasonId), isNull(seasonalIngredients.deletedAt)),
			});
			expect(result).toHaveLength(2);
		});

		it('sets seasonId and createdBy on new seasonal ingredients', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);

			const result = await db.query.seasonalIngredients.findMany({
				where: and(eq(seasonalIngredients.seasonId, testSeasonId), isNull(seasonalIngredients.deletedAt)),
			});
			expect(result[0].seasonId).toBe(testSeasonId);
			expect(result[0].createdBy).toBe(testUserId);
		});

		it('removes ingredients no longer in the list', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id, onion.id], testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);

			const result = await db.query.seasonalIngredients.findMany({
				where: and(eq(seasonalIngredients.seasonId, testSeasonId), isNull(seasonalIngredients.deletedAt)),
			});
			expect(result).toHaveLength(1);
			expect(result[0].ingredientId).toBe(tomato.id);
		});

		it('does not duplicate existing ingredients when called again with same list', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);

			const result = await db.query.seasonalIngredients.findMany({
				where: and(eq(seasonalIngredients.seasonId, testSeasonId), isNull(seasonalIngredients.deletedAt)),
			});
			expect(result).toHaveLength(1);
		});

		it('replaces the full set of ingredients', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);
			const garlic = await createIngredient({ name: 'Garlic' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id, onion.id], testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [onion.id, garlic.id], testUserId, logger);

			const result = await db.query.seasonalIngredients.findMany({
				where: and(eq(seasonalIngredients.seasonId, testSeasonId), isNull(seasonalIngredients.deletedAt)),
			});
			expect(result).toHaveLength(2);

			const ingredientIds = result.map(r => r.ingredientId);
			expect(ingredientIds).toContain(onion.id);
			expect(ingredientIds).toContain(garlic.id);
			expect(ingredientIds).not.toContain(tomato.id);
		});

		it('does not affect seasonal ingredients of other seasons', async () => {
			const otherSeason = await createSeason({ ...baseSeasonData, name: 'Winter' }, testUserId, logger);

			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(otherSeason.id, [onion.id], testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);

			const otherResult = await db.query.seasonalIngredients.findMany({
				where: and(eq(seasonalIngredients.seasonId, otherSeason.id), isNull(seasonalIngredients.deletedAt)),
			});
			expect(otherResult).toHaveLength(1);
			expect(otherResult[0].ingredientId).toBe(onion.id);
		});
	});
});
