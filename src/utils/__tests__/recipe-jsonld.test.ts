import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { RecipeScrapeJsonLdNode } from '@/types';
import { findRecipeNode } from '@/utils';

interface RecipeJsonLdFixture {
	description: string;
	jsonld: RecipeScrapeJsonLdNode[];
	expectedName?: string;
}

const fixturesDir = join(__dirname, 'fixtures/recipe-jsonld');
const fixtureFiles = readdirSync(fixturesDir).filter(f => f.endsWith('.json'));

describe('findRecipeNode — real-world payload fixtures', () => {
	it.each(fixtureFiles)('%s', file => {
		const fixture: RecipeJsonLdFixture = JSON.parse(readFileSync(join(fixturesDir, file), 'utf-8'));
		const node = findRecipeNode(fixture.jsonld);

		expect(node, `${file}: ${fixture.description}`).not.toBeNull();
		if (fixture.expectedName) {
			expect(node?.name, `${file}: expected recipe name`).toBe(fixture.expectedName);
		}
	});
});
