import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { parseRawIngredients } from '@/steps';
import type { RecipeIngredientDBRead } from '@/types';

const logger = createNoopLogger();

function dbRecipeIngredientsFromStrings(rawIngredients: string[]): RecipeIngredientDBRead[] {
	return rawIngredients.map(raw => {
		return {
			id: randomUUID(),
			raw,
		};
	}) as unknown as RecipeIngredientDBRead[];
}

describe('parseRawIngredients', () => {
	it('returns empty array when passed empty input', async () => {
		const result = await parseRawIngredients([], logger);
		expect(result).toEqual([]);
	});

	it('filters out items with no raw value', async () => {
		const recipeIngredients = [
			{ id: randomUUID(), raw: null },
			{ id: randomUUID(), raw: undefined },
			{ id: randomUUID(), raw: '1 onion' },
		] as unknown as RecipeIngredientDBRead[];

		const results = await parseRawIngredients(recipeIngredients, logger);

		expect(results).toHaveLength(1);
		expect(results[0]).toBe('onion');
	});

	it('returns empty array when all items lack a raw value', async () => {
		const recipeIngredients = [{ id: randomUUID(), raw: null }] as unknown as RecipeIngredientDBRead[];

		const results = await parseRawIngredients(recipeIngredients, logger);

		expect(results).toEqual([]);
	});

	it('deduplicates identical raw values before processing', async () => {
		const recipeIngredients = dbRecipeIngredientsFromStrings(['1 onion', '1 onion']);

		const results = await parseRawIngredients(recipeIngredients, logger);

		expect(results).toHaveLength(1);
		expect(results[0]).toBe('onion');
	});

	it('preserves hyphens in ingredient names', async () => {
		const recipeIngredients = dbRecipeIngredientsFromStrings(['3 cups cream-style corn']);

		const results = await parseRawIngredients(recipeIngredients, logger);

		expect(results[0]).toContain('cream-style corn');
	});

	it('returns a simple string when passed a valid recipe ingredient', async () => {
		const recipeIngredients = dbRecipeIngredientsFromStrings(['12 onions']);

		const results = await parseRawIngredients(recipeIngredients, logger);

		expect(results).toStrictEqual(['onions']);
	});
	it('handles stripping various numeric values and non-hyphen characters', async () => {
		const recipeIngredients = dbRecipeIngredientsFromStrings(['12 onions', '1.52 apples', '.4 slices of cheese', 'oranges (12)']);

		const results = await parseRawIngredients(recipeIngredients, logger);

		expect(results).toStrictEqual(['onions', 'apples', 'slices of cheese', 'oranges']);
	});
	it('handles our current list of recipe ingredients', async () => {
		const recipeIngredients = dbRecipeIngredientsFromStrings([
			'0.5 cup diced bacon',
			'4 medium potatoes, peeled and chopped',
			'1 medium onion, chopped',
			'3 cups cream-style corn',
			'2 cups water',
			'2 teaspoons salt',
			'ground black pepper to taste',
			'2 cups half-and-half',
		]);

		const results = await parseRawIngredients(recipeIngredients, logger);

		expect(results).toStrictEqual([
			'bacon',
			'potatoes',
			'onion',
			'cream-style corn',
			'water',
			'salt',
			'black pepper',
			'half-and-half',
		]);
	});
});
