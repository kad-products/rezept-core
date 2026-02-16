import { eq } from 'drizzle-orm';
import db from '@/db';
import { recipeIngredients } from '@/models';
import type { RecipeIngredient, RecipeIngredientFormSave } from '@/types';

export async function getIngredientsByRecipeSectionId(recipeSectionId: string): Promise<RecipeIngredient[]> {
	return await db.query.recipeIngredients.findMany({
		where: eq(recipeIngredients.recipeSectionId, recipeSectionId),
		with: {
			unit: true,
		},
	});
}

export async function updateRecipeIngredients(
	recipeSectionId: string,
	ingredientsData: RecipeIngredientFormSave[],
	userId: string,
): Promise<void> {
	console.log(
		`Updating recipe ingredients for recipeSectionId ${recipeSectionId} with data: ${JSON.stringify(ingredientsData, null, 4)} `,
	);

	// get existing ingredients for the recipe
	const existingIngredients = await db
		.select()
		.from(recipeIngredients)
		.where(eq(recipeIngredients.recipeSectionId, recipeSectionId));

	// remove ones that are not present in ingredientsData
	const removedIngredientIds = existingIngredients.map(i => i.id).filter(id => !ingredientsData.some(idData => idData.id === id));

	await Promise.all(removedIngredientIds.map(id => db.delete(recipeIngredients).where(eq(recipeIngredients.id, id))));

	console.log(`Removed ingredient IDs: ${JSON.stringify(removedIngredientIds, null, 4)} `);

	// update or insert ingredients from ingredientsData
	await Promise.all(
		ingredientsData.map(async (ingData: RecipeIngredientFormSave) => {
			if (ingData.id) {
				// update existing ingredients
				await db
					.update(recipeIngredients)
					.set({
						ingredientId: ingData.ingredientId,
						quantity: ingData.quantity,
						unitId: ingData.unitId,
						preparation: ingData.preparation,
						modifier: ingData.modifier,
						order: ingData.order,
						updatedBy: userId,
					})
					.where(eq(recipeIngredients.id, ingData.id));

				console.log(`Updated existing ingredient ID ${ingData.id}: ${JSON.stringify(ingData, null, 4)} `);
			} else {
				// insert new ingredient
				await db.insert(recipeIngredients).values({
					recipeSectionId: ingData.recipeSectionId,
					ingredientId: ingData.ingredientId,
					quantity: ingData.quantity,
					unitId: ingData.unitId,
					preparation: ingData.preparation,
					modifier: ingData.modifier,
					order: ingData.order,
					createdBy: userId,
				});

				console.log(
					`Inserted new ingredient for recipeSectionId ${ingData.recipeSectionId}: ${JSON.stringify(ingData, null, 4)} `,
				);
			}
		}),
	);

	console.log(
		`Updated/Inserted ingredients for recipeSectionId ${recipeSectionId}: ${JSON.stringify(ingredientsData, null, 4)} `,
	);
}
