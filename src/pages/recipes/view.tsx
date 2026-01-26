import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import RecipeView from '@/components/server/RecipeView';

export default function Pages__recipes__view({ ctx, params }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
        <RecipeView recipeId={ params.recipeId } />
    </StandardLayout>
  );
}
