import db from "@/db";
import { type Recipe, recipes } from "@/models/schema";

export async function getRecipes(): Promise<Recipe[]> {
  const allRecipes = await db.select().from(recipes);
  return allRecipes;
}