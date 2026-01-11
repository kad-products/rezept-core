import { faker } from '@faker-js/faker';
import { v5 as uuidv5 } from 'uuid';

import ingredients from "./ingredients.js";
import randomArrayElements from "../utils/random-array-elements.js";

const recipes = {
  'nacho-skillet': {
    title: "Nacho Skillet"
  },
  'banana-bread': {    
    title: "Banana Bread"
  }
}

export default Object.keys(recipes).map( key => ({
    ...recipes[key],
    id: uuidv5(key, uuidv5.URL),
    ingredients: randomArrayElements( ingredients, 8),
    instructions: new Array(8).fill(null).map(() => faker.lorem.paragraph()),
} ))