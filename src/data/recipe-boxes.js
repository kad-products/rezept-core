import { v5 as uuidv5 } from 'uuid';

const recipeBoxes = {
  'dehnel-household': {
    name: "Dehnel Household"
  },
  'lahn-home': {    
    name: "Lahn Home"
  }
}

export default Object.keys(recipeBoxes).map( key => ({
    ...recipeBoxes[key],
    id: uuidv5(key, uuidv5.URL)
  }))