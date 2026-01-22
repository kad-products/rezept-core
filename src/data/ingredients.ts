import { v5 as uuidv5 } from 'uuid';
import { faker } from '@faker-js/faker';

type Ingredient = {
  id: string;
  name: string;
};

const uniqueIngredients = [...new Set(new Array(60).fill(null).map(() => faker.food.ingredient()))];

const ingredients: Ingredient[] = uniqueIngredients.map(ingredient => ({
  id: uuidv5(ingredient, uuidv5.URL),
  name: ingredient
}));

export default ingredients;
export type { Ingredient };