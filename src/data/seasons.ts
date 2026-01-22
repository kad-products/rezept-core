import { v5 as uuidv5 } from 'uuid';

import ingredients, { type Ingredient } from "./ingredients.js";
import randomArrayElements from "../utils/random-array-elements.js";

type SeasonBase = {
  name: string;
  months: number[];
  location: string;
};

type Season = SeasonBase & {
  id: string;
  ingredients: Ingredient[];
};

const seasons: Record<string, SeasonBase> = {
  'early-summer-mn': {
    name: "Early Summer in MN",
    months: [4, 5, 6],
    location: "Minnesota"
  },
  'winter-wa': {    
    name: "Winter in WA",
    months: [10, 11, 12, 1, 2, 3],
    location: "Washington"
  }
};

const seasonsList: Season[] = Object.keys(seasons).map(key => ({
  ...seasons[key],
  id: uuidv5(key, uuidv5.URL),
  ingredients: randomArrayElements(ingredients, 3)
}));

export default seasonsList;
export type { Season, SeasonBase };