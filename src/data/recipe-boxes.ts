import { v5 as uuidv5 } from 'uuid';

type RecipeBoxBase = {
  name: string;
};

type RecipeBox = RecipeBoxBase & {
  id: string;
};

const recipeBoxes: Record<string, RecipeBoxBase> = {
  'dehnel-household': {
    name: "Dehnel Household"
  },
  'lahn-home': {    
    name: "Lahn Home"
  }
};

const recipeBoxesList: RecipeBox[] = Object.keys(recipeBoxes).map(key => ({
  ...recipeBoxes[key],
  id: uuidv5(key, uuidv5.URL)
}));

export default recipeBoxesList;
export type { RecipeBox, RecipeBoxBase };