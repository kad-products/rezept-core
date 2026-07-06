import { describe, expect, it } from 'vitest';
import { RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';
import { transformScrapeToRecipe } from '@/steps';

const logger = createNoopLogger();
const sourceUrl = 'https://example.com/recipe';

const baseRecipe = {
	'@type': 'Recipe',
	name: 'Test Recipe',
	description: 'A tasty recipe',
	recipeIngredient: ['2 cups flour', '1 cup sugar'],
	recipeInstructions: [
		{ '@type': 'HowToStep', text: 'Mix flour and sugar' },
		{ '@type': 'HowToStep', text: 'Bake at 350F for 30 minutes' },
	],
	recipeYield: '4',
	prepTime: 'PT15M',
	cookTime: 'PT1H',
};

describe('transformScrapeToRecipe', () => {
	it('transforms a complete recipe node', async () => {
		const result = await transformScrapeToRecipe(baseRecipe, sourceUrl, logger);

		expect(result.title).toBe('Test Recipe');
		expect(result.description).toBe('A tasty recipe');
		expect(result.source).toBe('https://example.com/recipe');
		expect(result.servings).toBe(4);
		expect(result.prepTime).toBe(15);
		expect(result.cookTime).toBe(60);
		expect(result.sections).toHaveLength(1);
		expect(result.sections[0].ingredients).toEqual([
			{ raw: '2 cups flour', order: 0 },
			{ raw: '1 cup sugar', order: 1 },
		]);
		expect(result.sections[0].instructions).toEqual([
			{ stepNumber: 1, instruction: 'Mix flour and sugar' },
			{ stepNumber: 2, instruction: 'Bake at 350F for 30 minutes' },
		]);
	});

	it('handles instructions as a plain string', async () => {
		const result = await transformScrapeToRecipe(
			{ ...baseRecipe, recipeInstructions: 'Combine all ingredients and bake.' },
			sourceUrl,
			logger,
		);

		expect(result.sections[0].instructions).toEqual([{ stepNumber: 1, instruction: 'Combine all ingredients and bake.' }]);
	});

	it('handles instructions as an array of strings', async () => {
		const result = await transformScrapeToRecipe(
			{ ...baseRecipe, recipeInstructions: ['Preheat oven.', 'Mix ingredients.', 'Bake 30 minutes.'] },
			sourceUrl,
			logger,
		);

		expect(result.sections[0].instructions).toEqual([
			{ stepNumber: 1, instruction: 'Preheat oven.' },
			{ stepNumber: 2, instruction: 'Mix ingredients.' },
			{ stepNumber: 3, instruction: 'Bake 30 minutes.' },
		]);
	});

	it('returns empty ingredients when recipeIngredient is absent', async () => {
		const { recipeIngredient: _, ...noIngredients } = baseRecipe;
		const result = await transformScrapeToRecipe(noIngredients, sourceUrl, logger);

		expect(result.sections[0].ingredients).toEqual([]);
	});

	it('returns empty instructions when recipeInstructions is absent', async () => {
		const { recipeInstructions: _, ...noInstructions } = baseRecipe;
		const result = await transformScrapeToRecipe(noInstructions, sourceUrl, logger);

		expect(result.sections[0].instructions).toEqual([]);
	});

	it('unescapes HTML entities in the title', async () => {
		const result = await transformScrapeToRecipe(
			{ ...baseRecipe, name: 'Mom&#39;s &amp; Dad&#39;s Favorite &quot;Special&quot;' },
			sourceUrl,
			logger,
		);

		expect(result.title).toBe(`Mom's & Dad's Favorite "Special"`);
	});

	it.each([
		['PT15M', 15],
		['PT1H', 60],
		['PT1H30M', 90],
		['PT2H15M', 135],
	])('parses ISO 8601 duration %s as %d minutes', async (duration, expected) => {
		const result = await transformScrapeToRecipe({ ...baseRecipe, prepTime: duration }, sourceUrl, logger);

		expect(result.prepTime).toBe(expected);
	});

	it('parses servings from a string with trailing text', async () => {
		const result = await transformScrapeToRecipe({ ...baseRecipe, recipeYield: '6 servings' }, sourceUrl, logger);

		expect(result.servings).toBe(6);
	});

	it('throws RzStepError 400 when the recipe node has no name', async () => {
		const { name: _, ...noName } = baseRecipe;

		await expect(transformScrapeToRecipe(noName, sourceUrl, logger)).rejects.toThrow(RzStepError);
		await expect(transformScrapeToRecipe(noName, sourceUrl, logger)).rejects.toMatchObject({ code: 400 });
	});

	it('throws RzStepError 400 when the recipe name is not a string', async () => {
		await expect(transformScrapeToRecipe({ ...baseRecipe, name: 42 }, sourceUrl, logger)).rejects.toThrow(RzStepError);
	});

	describe('cover image extraction', () => {
		it('extracts image from an ImageObject', async () => {
			const result = await transformScrapeToRecipe(
				{
					...baseRecipe,
					image: { '@type': 'ImageObject', url: 'https://example.com/photo.jpg', width: 1500, height: 1125 },
				},
				sourceUrl,
				logger,
			);

			expect(result.coverImage).toEqual({ url: 'https://example.com/photo.jpg', width: 1500, height: 1125 });
		});

		it('extracts image from a plain string URL', async () => {
			const result = await transformScrapeToRecipe({ ...baseRecipe, image: 'https://example.com/photo.jpg' }, sourceUrl, logger);

			expect(result.coverImage).toEqual({ url: 'https://example.com/photo.jpg' });
		});

		it('extracts image from an array, using the first element', async () => {
			const result = await transformScrapeToRecipe(
				{
					...baseRecipe,
					image: [
						{ '@type': 'ImageObject', url: 'https://example.com/first.jpg', width: 1500, height: 1125 },
						{ '@type': 'ImageObject', url: 'https://example.com/second.jpg', width: 400, height: 300 },
					],
				},
				sourceUrl,
				logger,
			);

			expect(result.coverImage?.url).toBe('https://example.com/first.jpg');
		});

		it('extracts image from an ImageObject missing width/height', async () => {
			const result = await transformScrapeToRecipe(
				{ ...baseRecipe, image: { '@type': 'ImageObject', url: 'https://example.com/photo.jpg' } },
				sourceUrl,
				logger,
			);

			expect(result.coverImage).toEqual({ url: 'https://example.com/photo.jpg' });
		});

		it('returns undefined coverImage when image field is absent', async () => {
			const result = await transformScrapeToRecipe(baseRecipe, sourceUrl, logger);
			expect(result.coverImage).toBeUndefined();
		});

		it('returns undefined coverImage when ImageObject has no url', async () => {
			const result = await transformScrapeToRecipe(
				{ ...baseRecipe, image: { '@type': 'ImageObject', thumbnailUrl: 'https://example.com/thumb.jpg' } },
				sourceUrl,
				logger,
			);

			expect(result.coverImage).toBeUndefined();
		});

		it('returns undefined coverImage when image array is empty', async () => {
			const result = await transformScrapeToRecipe({ ...baseRecipe, image: [] }, sourceUrl, logger);
			expect(result.coverImage).toBeUndefined();
		});
	});
});
