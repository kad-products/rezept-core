import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { transformScrapeToRecipe } from '@/steps';
import type { RecipeScrapeJsonLdNode } from '@/types';

interface TransformFixture {
	description: string;
	url: string;
	jsonld: RecipeScrapeJsonLdNode[];
	expected: {
		title?: string;
		servings?: number;
		ingredients?: { raw: string; order: number }[];
		cookingMethodInstructions?: { stepNumber: number; instruction: string }[];
	};
}

const fixturesDir = join(__dirname, 'fixtures/transform-scrape-to-recipe');
const fixtureFiles = readdirSync(fixturesDir).filter(f => f.endsWith('.json'));

const logger = createNoopLogger();

describe('transformScrapeToRecipe — real-world payload fixtures', () => {
	it.each(fixtureFiles)('%s', async file => {
		const fixture: TransformFixture = JSON.parse(readFileSync(join(fixturesDir, file), 'utf-8'));
		const result = await transformScrapeToRecipe({ url: fixture.url, jsonld: fixture.jsonld }, logger);
		const label = `${file}: ${fixture.description}`;

		if (fixture.expected.title !== undefined) {
			expect(result.title, label).toBe(fixture.expected.title);
		}
		if (fixture.expected.servings !== undefined) {
			expect(result.servings, label).toBe(fixture.expected.servings);
		}
		if (fixture.expected.ingredients !== undefined) {
			expect(result.sections[0].ingredients, label).toEqual(fixture.expected.ingredients);
		}
		if (fixture.expected.cookingMethodInstructions !== undefined) {
			expect(result.sections[0].cookingMethods[0].instructions, label).toEqual(fixture.expected.cookingMethodInstructions);
		}
	});
});
