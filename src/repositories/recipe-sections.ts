import { eq } from "drizzle-orm";
import db from "@/db";
import { type RecipeSection, recipeSections } from "@/models/schema";

export async function getSectionsByRecipeId(
  recipeId: string,
): Promise<RecipeSection[]> {

  const sections = await db.select().from(recipeSections).where(eq(recipeSections.recipeId, recipeId));

  return sections.sort( ( a, b ) => a.order - b.order );

}
