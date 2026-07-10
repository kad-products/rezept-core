const measurements: string[] = ['cup', 'teaspoon'];
const modifiers: string[] = ['to taste', 'ground', 'diced', 'peeled and chopped', 'chopped', 'medium'];

export default async function explicitRules(rawIngredients: string[]): Promise<string[]> {
	// remove numbers and non-hyphen characters
	rawIngredients = rawIngredients.map(raw => raw?.replace(/[0-9().,]/g, '').trim());

	// remove measurements
	const measurementsRegex = new RegExp(`\\b(${measurements.flatMap(m => [m, `${m}s`]).join('|')})\\b`, 'g');
	rawIngredients = rawIngredients.map(raw => raw.replaceAll(measurementsRegex, '').trim());

	// remove modifiers
	const modifiersRegex = new RegExp(`\\b(${modifiers.join('|')})\\b`, 'g');
	rawIngredients = rawIngredients.map(raw => raw.replaceAll(modifiersRegex, '').trim());

	return rawIngredients;
}
