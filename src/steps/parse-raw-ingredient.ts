import { parseIngredient } from '@jlucaspains/sharp-recipe-parser';
import { RzStepError } from '@/classes';
import type { RzLogger } from '@/types';

const measurements: string[] = ['cup', 'tsp', 'teaspoon', 'tbsp', 'pinch'];
const measurementsRegex = new RegExp(`\\b(${measurements.flatMap(m => [m, `${m}s`]).join('|')})\\b`, 'g');
const modifiers: string[] = ['to taste', 'diced', 'plus', 'peeled and chopped', 'oz', 'shredded'];
const modifiersRegex = new RegExp(`\\b(${modifiers.join('|')})\\b`, 'g');

// Words that are valid within a longer ingredient name but meaningless as the entire result.
// Used to drop entries where the parser returned only a size/unit word with no actual ingredient.
const DISALLOWED_STANDALONE: Set<string> = new Set(['medium', 'packet']);

export function parseRawIngredient(rawIngredient: string, logger: RzLogger): string | undefined {
	try {
		let parsedIngredient: string = rawIngredient;
		try {
			const parsed = parseIngredient(rawIngredient, 'en');
			if (!parsed?.ingredient) {
				throw new Error(`Did not parse out an ingredient`);
			}
			parsedIngredient = parsed.ingredient;
		} catch (err) {
			logger.error(`Ingredient ${rawIngredient}: ${err}`);
		}

		// remove numbers and non-hyphen characters
		parsedIngredient = parsedIngredient.replace(/[0-9().,+%]/g, '').trim();
		logger.debug(`After numbers and non-hyphen characters`);

		// strip leading non-alpha leading characters
		parsedIngredient = parsedIngredient.replace(/^[^a-zA-Z]+/, '').trim();
		logger.debug(`After stripping leading non-alpha characters`);

		// lowercase everything
		parsedIngredient = parsedIngredient.toLowerCase();
		logger.debug(`After lowercasing everything`);

		// strip leading articles
		parsedIngredient = parsedIngredient.replace(/^(a|an|the)\s+/, '').trim();
		logger.debug(`After stripping leading articles`);

		// remove measurements
		parsedIngredient = parsedIngredient.replaceAll(measurementsRegex, '').trim();
		logger.debug(`After removing measurements`);

		// remove modifiers
		parsedIngredient = parsedIngredient.replaceAll(modifiersRegex, '').trim();
		logger.debug(`After removing modifiers`);

		// strip leading connectors left exposed after measurement/modifier removal
		parsedIngredient = parsedIngredient.replace(/^(of|or)\s+/, '').trim();
		logger.debug(`After stripping leading connectors`);

		// back-to-back spaces
		parsedIngredient = parsedIngredient.replace(/ {2,}/g, ' ');
		logger.debug(`After stripping back-to-back spaces`);

		if (DISALLOWED_STANDALONE.has(parsedIngredient)) {
			return undefined;
		}

		return parsedIngredient;
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
