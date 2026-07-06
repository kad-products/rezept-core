import { RzStepError } from '@/classes';
import type { RecipeScrapeJsonLdNode, RzLogger } from '@/types';

export function scrapeExtractRecipeNode(jsonld: RecipeScrapeJsonLdNode[], logger: RzLogger): RecipeScrapeJsonLdNode {
	const recipeNode = findRecipeNode(jsonld);

	if (!recipeNode) {
		throw new RzStepError(400, 'No Recipe schema found in payload', `No recipe found in payload`);
	}

	logger.info(`Found recipe`);

	return recipeNode;
}

function isRecipeNode(node: RecipeScrapeJsonLdNode): boolean {
	const type = node['@type'];
	return Array.isArray(type) ? type.includes('Recipe') : type === 'Recipe';
}

function findRecipeNode(jsonld: RecipeScrapeJsonLdNode[]): RecipeScrapeJsonLdNode | null {
	for (const item of jsonld) {
		if (!item || typeof item !== 'object') continue;
		const node = item as RecipeScrapeJsonLdNode;

		// Handle @graph wrapper
		if (Array.isArray(node['@graph'])) {
			const found = findRecipeNode(node['@graph']);
			if (found) return found;
		}

		// Handle nested arrays (as sent by the bookmarklet)
		if (Array.isArray(item)) {
			const found = findRecipeNode(item);
			if (found) return found;
		}

		if (isRecipeNode(node)) return node;
	}
	return null;
}
