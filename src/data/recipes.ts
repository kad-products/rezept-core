import { faker } from '@faker-js/faker';
import { v5 as uuidv5 } from 'uuid';
import randomArrayElements from '../utils/random-array-elements';
import ingredients from './ingredients';

type RecipeBase = {
	title: string;
};

type Recipe = RecipeBase & {
	id: string;
	ingredients: typeof ingredients;
	instructions: string[];
};

const recipes: Record<string, RecipeBase> = {
	'nacho-skillet': {
		title: 'Nacho Skillet',
	},
	'banana-bread': {
		title: 'Banana Bread',
	},
};

const recipesList: Recipe[] = Object.keys(recipes).map(key => ({
	...recipes[key],
	id: uuidv5(key, uuidv5.URL),
	ingredients: randomArrayElements(ingredients, 8),
	instructions: new Array(8).fill(null).map(() => faker.lorem.paragraph()),
}));

export default recipesList;
