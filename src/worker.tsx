import { render, route, prefix } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/Document";
import { setCommonHeaders } from "@/headers";
import { authRoutes } from "@/passkey/routes";
import { setupPasskeyAuth } from "@/passkey/setup";
import { Session } from "@/session/durableObject";
import { getUserById } from "@/repositories/users";
import { type User } from "@/models/schema";
import { sessions } from "@/session/store";

import profileRoutes from "@/pages/profile/routes";
import Pages__root from "./pages/root";

import GroceryStores from "./grocery-stores/GroceryStores";
import GroceryStore from "./grocery-stores/GroceryStore";
import RecipeBoxes from "./recipe-boxes/RecipeBoxes";
import RecipeBox from "./recipe-boxes/RecipeBox";
import Recipes from "./recipes/Recipes";
import Recipe from "./recipes/Recipe";
import RecipeAdd from "./recipes/Add";
import RecipeFeedback from "./recipes/FeedbackAdd";
import RecipeCooksNotes from "./recipes/CooksNotes";
import RecipeCooksNoteAdd from "./recipes/CooksNoteAdd";
import Seasons from "./seasons/Seasons";
import Season from "./seasons/Season";

export type AppContext = {
  session: Session | null;
	user: User | undefined;
};
export { SessionDurableObject } from "@/session/durableObject";

export default defineApp([
  setCommonHeaders(),
  setupPasskeyAuth(),
  async ({ ctx, request }) => {
    if (ctx.session?.userId) {
      try {
			  ctx.user = await getUserById( ctx.session.userId );
      } catch( err ) {
        console.log( `Error fetching current user: ${ err }` )
        const headers = new Headers();
        await sessions.remove(request, headers);
        headers.set("Location", "/");
  
        return new Response(null, {
          status: 302,
          headers,
        });
      }
		}
  },
  render(Document, [
    route("/", Pages__root),

    prefix("/auth", authRoutes()),
    prefix("/profile", profileRoutes),

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
