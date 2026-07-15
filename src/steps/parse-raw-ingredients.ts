import { parseIngredient } from '@jlucaspains/sharp-recipe-parser';
import { RzStepError } from '@/classes';
import type { RecipeIngredientDBRead, RzLogger } from '@/types';

const measurements: string[] = ['cup', 'tsp', 'teaspoon', 'tbsp', 'pinch'];
const modifiers: string[] = ['to taste', 'diced', 'plus', 'peeled and chopped', 'oz', 'shredded'];

// Words that are valid within a longer ingredient name but meaningless as the entire result.
// Used to drop entries where the parser returned only a size/unit word with no actual ingredient.
const DISALLOWED_STANDALONE: Set<string> = new Set(['medium', 'packet']);

export async function parseRawIngredients(rawRecipeIngredients: RecipeIngredientDBRead[], logger: RzLogger): Promise<string[]> {
	try {
		logger.debug(`Received ${rawRecipeIngredients.length} recipe ingredients`);

		// biome-ignore lint/style/noNonNullAssertion: guaranteed by the ing.raw check
		const rawIngredients: string[] = rawRecipeIngredients.filter(ing => ing.raw).map(r => r.raw!);
		logger.debug(`Found ${rawIngredients.length} to have a raw property`);

		// use NLP library for most things
		let justIngredients: string[] = [];
		try {
			justIngredients = rawIngredients.flatMap(ing => {
				try {
					const parsed = parseIngredient(ing, 'en');
					return parsed?.ingredient ? [parsed.ingredient] : [];
				} catch (err) {
					logger.error(`Ingredient: ${ing}: ${err}`);
				}
				return [];
			});
		} catch (err) {
			logger.error(`Error parsing ingredients: ${err}`);
		}

		logger.debug(`Found ${justIngredients.length} after parsing`);

		// remove numbers and non-hyphen characters
		let cleanedIngredients: string[] = justIngredients.map(raw => raw?.replace(/[0-9().,+%]/g, '').trim());

		logger.debug(`After numbers and non-hyphen characters`);

		// strip leading non-alpha leading characters
		cleanedIngredients = cleanedIngredients.map(ing => ing.replace(/^[^a-zA-Z]+/, '').trim());

		logger.debug(`After stripping leading non-alpha characters`);

		// lowercase everything
		cleanedIngredients = cleanedIngredients.map(ing => ing.toLowerCase());

		logger.debug(`After lowercasing everything`);

		// strip leading articles
		cleanedIngredients = cleanedIngredients.map(ing => ing.replace(/^(a|an|the)\s+/, '').trim());

		logger.debug(`After stripping leading articles`);

		// remove measurements
		const measurementsRegex = new RegExp(`\\b(${measurements.flatMap(m => [m, `${m}s`]).join('|')})\\b`, 'g');
		cleanedIngredients = cleanedIngredients.map(raw => raw.replaceAll(measurementsRegex, '').trim());
		logger.debug(`After removing measurements`);

		// remove modifiers
		const modifiersRegex = new RegExp(`\\b(${modifiers.join('|')})\\b`, 'g');
		cleanedIngredients = cleanedIngredients.map(raw => raw.replaceAll(modifiersRegex, '').trim());
		logger.debug(`After removing modifiers`);

		// strip leading connectors left exposed after measurement/modifier removal
		cleanedIngredients = cleanedIngredients.map(ing => ing.replace(/^(of|or)\s+/, '').trim());
		logger.debug(`After stripping leading connectors`);

		// back-to-back spaces
		cleanedIngredients = cleanedIngredients.map(ing => ing.replace(/ {2,}/g, ' '));
		logger.debug(`After stripping back-to-back spaces`);

		// drop entries that are only a standalone size/unit word with no actual ingredient
		cleanedIngredients = cleanedIngredients.filter(ing => !DISALLOWED_STANDALONE.has(ing));
		logger.debug(`After removing entries that are just standalone size and units`);

		return Array.from(new Set(cleanedIngredients.filter(Boolean)));
	} catch (err) {
		throw new RzStepError(
			400,
			'Error parsing raw ingredients',
			`Unexpected error in parsing the raw ingredients, see logs for more details: ${err}`,
			false,
			err,
		);
	}
}
