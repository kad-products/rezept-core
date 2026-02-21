import { eq } from 'drizzle-orm';
import db from '@/db';
import { recipeInstructions } from '@/models';
import type { RecipeInstruction, RecipeInstructionFormSave } from '@/types';

export async function getInstructionsByRecipeSectionId(recipeSectionId: string): Promise<RecipeInstruction[]> {
	const instructions = await db.select().from(recipeInstructions).where(eq(recipeInstructions.recipeSectionId, recipeSectionId));

	return instructions.sort((a, b) => a.stepNumber - b.stepNumber);
}

export async function updateRecipeInstructions(
	recipeSectionId: string,
	instructionsData: RecipeInstructionFormSave[],
	userId: string,
): Promise<RecipeInstruction[]> {
	console.log(
		`Updating recipe instructions for recipeSectionId ${recipeSectionId} with data: ${JSON.stringify(instructionsData, null, 4)} `,
	);

	// get existing instructions for the recipe
	const existingInstructions = await db
		.select()
		.from(recipeInstructions)
		.where(eq(recipeInstructions.recipeSectionId, recipeSectionId));

	// remove ones that are not present in instructionsData
	const removedInstructionIds = existingInstructions
		.map(i => i.id)
		.filter(id => !instructionsData.some(idData => idData.id === id));

	await Promise.all(removedInstructionIds.map(id => db.delete(recipeInstructions).where(eq(recipeInstructions.id, id))));

	console.log(`Removed instruction IDs: ${JSON.stringify(removedInstructionIds, null, 4)} `);

	// update or insert instructions from instructionsData
	const savedInstructions = await Promise.all(
		instructionsData.map(async (instData: RecipeInstructionFormSave) => {
			if (instData.id) {
				// update existing instruction
				const [updatedInstruction] = await db
					.update(recipeInstructions)
					.set({
						stepNumber: instData.stepNumber,
						instruction: instData.instruction,
						updatedBy: userId,
					})
					.where(eq(recipeInstructions.id, instData.id))
					.returning();

				console.log(`Updated existing instruction ID ${instData.id}: ${JSON.stringify(instData, null, 4)} `);
				return updatedInstruction;
			} else {
				// insert new instruction
				const [newInstruction] = await db
					.insert(recipeInstructions)
					.values({
						recipeSectionId,
						stepNumber: instData.stepNumber,
						instruction: instData.instruction,
						createdBy: userId,
					})
					.returning();

				console.log(`Inserted new instruction for recipeSectionId ${recipeSectionId}: ${JSON.stringify(instData, null, 4)} `);

				return newInstruction;
			}
		}),
	);

	console.log(
		`Updated/Inserted instructions for recipeSectionId ${recipeSectionId}: ${JSON.stringify(instructionsData, null, 4)} `,
	);

	return savedInstructions;
}
