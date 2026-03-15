// Intermediate type representing a parsed import before ingredient/unit resolution
export type ParsedRecipeImport = {
	title: string;
	description?: string;
	source?: string;
	servings?: number;
	prepTime?: number;
	cookTime?: number;
	rawIngredients: string[];
	instructions: { stepNumber: number; instruction: string }[];
};

type JsonLdNode = Record<string, unknown>;

function unescapeHtml(str: string): string {
	return str
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function isRecipeNode(node: JsonLdNode): boolean {
	const type = node['@type'];
	return Array.isArray(type) ? type.includes('Recipe') : type === 'Recipe';
}

function findRecipeNode(jsonld: unknown[]): JsonLdNode | null {
	for (const item of jsonld) {
		if (!item || typeof item !== 'object') continue;
		const node = item as JsonLdNode;

		// Handle @graph wrapper
		if (Array.isArray(node['@graph'])) {
			const found = findRecipeNode(node['@graph'] as unknown[]);
			if (found) return found;
		}

		// Handle nested arrays (as sent by the bookmarklet)
		if (Array.isArray(item)) {
			const found = findRecipeNode(item as unknown[]);
			if (found) return found;
		}

		if (isRecipeNode(node)) return node;
	}
	return null;
}

// Parses ISO 8601 duration strings like PT15M, PT1H30M to minutes
export function parseDuration(duration: string): number | undefined {
	if (!duration) return undefined;
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
	if (!match) return undefined;
	const hours = parseInt(match[1] ?? '0', 10);
	const minutes = parseInt(match[2] ?? '0', 10);
	const total = hours * 60 + minutes;
	return total > 0 ? total : undefined;
}

function parseInstructions(raw: unknown): { stepNumber: number; instruction: string }[] {
	if (!raw) return [];

	// Plain string
	if (typeof raw === 'string') {
		return [{ stepNumber: 1, instruction: raw.trim() }];
	}

	if (!Array.isArray(raw)) {
		throw new Error(`Unexpected structure or data type for instructions: ${JSON.stringify(raw)}`);
	}

	return raw.flatMap((item, i) => {
		// Array of strings
		if (typeof item === 'string') {
			return [{ stepNumber: i + 1, instruction: item.trim() }];
		}

		// HowToStep objects
		if (item && typeof item === 'object') {
			const node = item as JsonLdNode;
			const text = typeof node.text === 'string' ? node.text.trim() : null;
			if (text) return [{ stepNumber: i + 1, instruction: text }];
		}

		throw new Error(`Unexpected structure or data type for instructions: ${JSON.stringify(raw)}`);
	});
}

function parseServings(raw: unknown): number | undefined {
	if (!raw) return undefined;
	const str = String(raw).trim();
	const num = parseInt(str, 10);
	return Number.isNaN(num) ? undefined : num;
}

export function parseJsonLd(payload: { url: string; jsonld: unknown[] }): ParsedRecipeImport {
	const recipe = findRecipeNode(payload.jsonld);

	if (!recipe) {
		throw new Error('No Recipe schema found in payload');
	}

	const title = typeof recipe.name === 'string' ? unescapeHtml(recipe.name).trim() : null;
	if (!title) {
		throw new Error('Recipe has no name');
	}

	const description = typeof recipe.description === 'string' ? unescapeHtml(recipe.description).trim() : undefined;

	const rawIngredients = Array.isArray(recipe.recipeIngredient)
		? (recipe.recipeIngredient as unknown[]).filter((i): i is string => typeof i === 'string')
		: [];

	return {
		title,
		description,
		source: payload.url,
		servings: parseServings(recipe.recipeYield),
		prepTime: typeof recipe.prepTime === 'string' ? parseDuration(recipe.prepTime) : undefined,
		cookTime: typeof recipe.cookTime === 'string' ? parseDuration(recipe.cookTime) : undefined,
		rawIngredients,
		instructions: parseInstructions(recipe.recipeInstructions),
	};
}
