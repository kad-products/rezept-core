import { eq } from 'drizzle-orm';
import db from '@/db';
import { type RecipeIngredient, recipeIngredients } from '@/models/schema';

export async function getIngredientsByRecipeSectionId(
	recipeSectionId: string,
): Promise<RecipeIngredient[]> {
	return await db.query.recipeIngredients.findMany({
		where: eq(recipeIngredients.recipeSectionId, recipeSectionId),
		with: {
			unit: true,
		},
	});
}
