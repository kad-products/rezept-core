import { parseIngredient } from '@jlucaspains/sharp-recipe-parser';

export default async function explicitRules(rawIngredients: string[]): Promise<string[]> {
	return rawIngredients.map(ing => {
		const parsed = parseIngredient(ing, 'en');
		if (!parsed?.ingredient) {
			console.log(ing, parsed);
			process.exit();
		}
		return parsed.ingredient;
	});
}
