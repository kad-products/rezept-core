import { describe, expect, it } from 'vitest';
import { RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';
import { scrapeExtractRecipeNode } from '@/steps';
import type { RecipeScrapeJsonLdNode } from '@/types';

const logger = createNoopLogger();

const baseRecipe = {
	'@type': 'Recipe',
	name: 'Test Recipe',
};

describe('scrapeExtractRecipeNode', () => {
	it('returns the Recipe node from a flat jsonld array', async () => {
		const result = scrapeExtractRecipeNode([baseRecipe], logger);

		expect(result).toBe(baseRecipe);
	});

	it('finds a recipe node inside an @graph wrapper', async () => {
		const result = scrapeExtractRecipeNode([{ '@graph': [baseRecipe] }], logger);

		expect(result).toBe(baseRecipe);
	});

	it('finds a recipe node inside a nested array (bookmarklet format)', async () => {
		const result = scrapeExtractRecipeNode([[baseRecipe]] as unknown as RecipeScrapeJsonLdNode[], logger);

		expect(result).toBe(baseRecipe);
	});

	it('accepts @type as an array containing Recipe', async () => {
		const node = { ...baseRecipe, '@type': ['Recipe', 'Thing'] };
		const result = scrapeExtractRecipeNode([node], logger);

		expect(result).toBe(node);
	});

	it('throws RzStepError 400 when no Recipe node is found', async () => {
		expect(scrapeExtractRecipeNode([{ '@type': 'WebPage', name: 'Not a recipe' }], logger)).rejects.toThrow(RzStepError);
		expect(scrapeExtractRecipeNode([{ '@type': 'WebPage', name: 'Not a recipe' }], logger)).rejects.toMatchObject({
			code: 400,
		});
	});

	it('throws RzStepError 400 for an empty jsonld array', async () => {
		expect(scrapeExtractRecipeNode([], logger)).rejects.toThrow(RzStepError);
	});
});
