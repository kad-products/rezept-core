import { parseIngredient } from 'parse-ingredient';

export default async function explicitRules(rawIngredients: string[]): Promise<string[]> {
	return rawIngredients.map(ing => {
		const parsed = parseIngredient(ing);
		if (parsed.length !== 1) {
			console.log(ing, parsed);
			process.exit();
		}
		return parsed[0].description;
	});
}
