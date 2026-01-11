import { v5 as uuidv5 } from 'uuid';
import { faker } from '@faker-js/faker';

const uniqueIngredients = [ ...new Set(new Array(60).fill(null).map(() => faker.food.ingredient())) ];

export default uniqueIngredients.map( ingredient => ({
    id: uuidv5(ingredient, uuidv5.URL),
    name: ingredient
}))