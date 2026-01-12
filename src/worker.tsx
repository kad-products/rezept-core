import { render, route, prefix } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { authRoutes } from "@/passkey/routes";
import { setupPasskeyAuth } from "@/passkey/setup";
import { Session } from "@/session/durableObject";

import Home from "@/app/pages/Home";
import GroceryStores from "./app/pages/grocery-stores/GroceryStores";
import GroceryStore from "./app/pages/grocery-stores/GroceryStore";
import RecipeBoxes from "./app/pages/recipe-boxes/RecipeBoxes";
import RecipeBox from "./app/pages/recipe-boxes/RecipeBox";
import Recipes from "./app/pages/recipes/Recipes";
import Recipe from "./app/pages/recipes/Recipe";
import RecipeAdd from "./app/pages/recipes/Add";
import RecipeFeedback from "./app/pages/recipes/FeedbackAdd";
import RecipeCooksNotes from "./app/pages/recipes/CooksNotes";
import RecipeCooksNoteAdd from "./app/pages/recipes/CooksNoteAdd";
import Seasons from "./app/pages/seasons/Seasons";
import Season from "./app/pages/seasons/Season";

export type AppContext = {
  session: Session | null;
};
export { SessionDurableObject } from "@/session/durableObject";
export { PasskeyDurableObject } from "@/passkey/durableObject";

export default defineApp([
  setCommonHeaders(),
  setupPasskeyAuth(),
  ({ ctx }) => {
    // setup ctx here
    ctx;
  },
  render(Document, [
    route("/", Home),

    prefix("/auth", authRoutes()),

    route("/grocery-stores", GroceryStores),
    route("/grocery-stores/:id", GroceryStore),
    
    route("/recipe-boxes", RecipeBoxes),
    route("/recipe-boxes/:id", RecipeBox),

    route("/recipes", Recipes), 
    route("/recipes/:id", Recipe),
    route("/recipes/:id/add", RecipeAdd),
    route("/recipes/:id/feedback", RecipeFeedback),
    route("/recipes/:id/cooks-notes", RecipeCooksNotes),
    route("/recipes/:id/cooks-notes/add", RecipeCooksNoteAdd),

    route("/seasons", Seasons),
		route("/seasons/:id", Season),
  ]),
]);
