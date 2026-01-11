import { v5 as uuidv5 } from 'uuid';

import ingredients from "./ingredients.js";
import randomArrayElements from "../utils/random-array-elements.js";

const seasons = {
  'early-summer-mn': {
    name: "Early Summer in MN",
    months: [4, 5, 6],
    location: "Minnesota"
  },
  'winter-wa': {    
    name: "Winter in WA",
    months: [ 10, 11, 12, 1, 2, 3 ],
    location: "Washington"
  }
}

export default Object.keys(seasons).map( key => ({
    ...seasons[key],
    id: uuidv5(key, uuidv5.URL),
    ingredients: randomArrayElements( ingredients, 3)
  }))