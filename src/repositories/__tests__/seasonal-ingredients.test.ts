import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createIngredient } from '../ingredients';
import { getIngredientsBySeasonId, updateSeasonalIngredientsForSeason } from '../seasonal-ingredients';
import { createSeason } from '../seasons';

const logger = new Logger();

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
		const user = await createUser('testuser', logger);
		testUserId = user.id;
		const season = await createSeason(baseSeasonData, testUserId, logger);
		testSeasonId = season.id;
	});

	describe('getIngredientsBySeasonId', () => {
		it('returns empty array when season has no ingredients', async () => {
			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result).toEqual([]);
		});

		it('returns seasonal ingredients with ingredient relation', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);

			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].ingredient).toBeDefined();
			expect(result[0].ingredient.id).toBe(tomato.id);
			expect(result[0].ingredient.name).toBe('Tomato');
		});

		it('returns all seasonal ingredients for season', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);
			const garlic = await createIngredient({ name: 'Garlic' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id, onion.id, garlic.id], testUserId, logger);

			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result).toHaveLength(3);
		});

		it('returns only ingredients for the specified season', async () => {
			const otherSeason = await createSeason({ ...baseSeasonData, name: 'Winter' }, testUserId, logger);

			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);
			await updateSeasonalIngredientsForSeason(otherSeason.id, [onion.id], testUserId, logger);

			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].ingredient.id).toBe(tomato.id);
		});
	});

	describe('updateSeasonalIngredientsForSeason', () => {
		it('adds ingredients to a season', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id, onion.id], testUserId, logger);

			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result).toHaveLength(2);
		});

		it('sets seasonId and createdBy on new seasonal ingredients', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);

			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result[0].seasonId).toBe(testSeasonId);
			expect(result[0].createdBy).toBe(testUserId);
		});

		it('removes ingredients no longer in the list', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id, onion.id], testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);

			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].ingredient.id).toBe(tomato.id);
		});

		it('does not duplicate existing ingredients when called again with same list', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id], testUserId, logger);

			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result).toHaveLength(1);
		});

		it('replaces the full set of ingredients', async () => {
			const tomato = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const onion = await createIngredient({ name: 'Onion' }, testUserId, logger);
			const garlic = await createIngredient({ name: 'Garlic' }, testUserId, logger);

			await updateSeasonalIngredientsForSeason(testSeasonId, [tomato.id, onion.id], testUserId, logger);
			await updateSeasonalIngredientsForSeason(testSeasonId, [onion.id, garlic.id], testUserId, logger);

			const result = await getIngredientsBySeasonId(testSeasonId, logger);
			expect(result).toHaveLength(2);

			const ingredientIds = result.map(r => r.ingredient.id);
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

			const otherResult = await getIngredientsBySeasonId(otherSeason.id, logger);
			expect(otherResult).toHaveLength(1);
			expect(otherResult[0].ingredient.id).toBe(onion.id);
		});
	});
});
