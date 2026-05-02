import { describe, expect, it } from 'vitest';
import { RzStepError } from '@/classes';
import Logger from '@/logger';
import { validateAsRecipe } from '@/steps';
import type { ParsedRecipeScrape } from '@/types';

const logger = new Logger();
const userId = '123e4567-e89b-42d3-a456-556642440000';

const validScrape: ParsedRecipeScrape = {
	title: 'Test Recipe',
	sections: [
		{
			order: 0,
			ingredients: [{ raw: '1 cup flour', order: 0 }],
			instructions: [{ stepNumber: 1, instruction: 'Mix well and bake' }],
		},
	],
};

describe('validateAsRecipe', () => {
	it('returns validated recipe data for valid input', async () => {
		const result = await validateAsRecipe(validScrape, userId, logger);

		expect(result.title).toBe('Test Recipe');
		expect(result.authorId).toBe(userId);
		expect(result.sections).toHaveLength(1);
	});

	it('includes optional fields when provided', async () => {
		const scrape: ParsedRecipeScrape = {
			...validScrape,
			description: 'A great recipe',
			source: 'https://example.com/recipe',
			servings: 4,
			prepTime: 15,
			cookTime: 30,
		};

		const result = await validateAsRecipe(scrape, userId, logger);

		expect(result.description).toBe('A great recipe');
		expect(result.source).toBe('https://example.com/recipe');
		expect(result.servings).toBe(4);
		expect(result.prepTime).toBe(15);
		expect(result.cookTime).toBe(30);
	});

	it('throws RzStepError 400 when title is empty', async () => {
		const scrape: ParsedRecipeScrape = { ...validScrape, title: '' };

		await expect(validateAsRecipe(scrape, userId, logger)).rejects.toThrow(RzStepError);
		await expect(validateAsRecipe(scrape, userId, logger)).rejects.toMatchObject({ code: 400 });
	});

	it('throws RzStepError 400 when userId is not a valid UUID', async () => {
		await expect(validateAsRecipe(validScrape, 'not-a-uuid', logger)).rejects.toThrow(RzStepError);
		await expect(validateAsRecipe(validScrape, 'not-a-uuid', logger)).rejects.toMatchObject({ code: 400 });
	});

	it('throws RzStepError 400 when sections array is empty', async () => {
		const scrape: ParsedRecipeScrape = { ...validScrape, sections: [] };

		await expect(validateAsRecipe(scrape, userId, logger)).rejects.toThrow(RzStepError);
		await expect(validateAsRecipe(scrape, userId, logger)).rejects.toMatchObject({ code: 400 });
	});
});
