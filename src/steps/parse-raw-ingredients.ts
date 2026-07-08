import { RzStepError } from '@/classes';
import type { RecipeIngredientDBRead, RzLogger } from '@/types';

const measurements: string[] = ['cup', 'teaspoon'];
const modifiers: string[] = ['to taste', 'ground', 'diced', 'peeled and chopped', 'chopped', 'medium'];

export async function parseRawIngredients(rawRecipeIngredients: RecipeIngredientDBRead[], logger: RzLogger): Promise<string[]> {
	try {
		logger.debug(`Received ${rawRecipeIngredients.length} recipe ingredients`);

		// biome-ignore lint/style/noNonNullAssertion: guaranteed by the ingWithRaw filtering above
		let rawIngredients = rawRecipeIngredients.filter(ing => ing.raw).map(r => r.raw!);
		logger.debug(`Found ${rawIngredients.length} to have a raw property`);

		// deduplicate
		rawIngredients = Array.from(new Set(rawIngredients));
		logger.debug(`Have ${rawIngredients.length} left after deduplication`);

		// remove numbers and non-hyphen characters
		rawIngredients = rawIngredients.map(raw => raw?.replace(/[0-9().,]/g, '').trim());

		// remove measurements
		const measurementsRegex = new RegExp(`\\b(${measurements.flatMap(m => [m, `${m}s`]).join('|')})\\b`, 'g');
		rawIngredients = rawIngredients.map(raw => raw.replaceAll(measurementsRegex, '').trim());

		// remove modifiers
		const modifiersRegex = new RegExp(`\\b(${modifiers.join('|')})\\b`, 'g');
		rawIngredients = rawIngredients.map(raw => raw.replaceAll(modifiersRegex, '').trim());

		return rawIngredients;
	} catch (err) {
		throw new RzStepError(
			400,
			'Error parsing raw ingredients',
			`Unexpected error in parsing the raw ingredients, see logs for more details: ${err}`,
			false,
			err instanceof Error ? err.cause : undefined,
		);
	}
}
