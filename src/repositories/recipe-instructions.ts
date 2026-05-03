import { eq } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeInstructions } from '@/models';
import type { RecipeInstructionDBRead, RecipeInstructionFormSave } from '@/types';

export async function getInstructionsByRecipeSectionId(
	recipeSectionId: string,
	logger: RzLogger,
): Promise<RecipeInstructionDBRead[]> {
	logger.debug(`Fetching instructions for section ${recipeSectionId}`);
	const instructions = await db.select().from(recipeInstructions).where(eq(recipeInstructions.recipeSectionId, recipeSectionId));
	logger.debug(`Fetched ${instructions.length} instructions for section ${recipeSectionId}`);
	return instructions.sort((a, b) => a.stepNumber - b.stepNumber);
}

export async function updateRecipeInstructions(
	recipeSectionId: string,
	instructionsData: RecipeInstructionFormSave[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeInstructionDBRead[]> {
	logger.debug(`Updating instructions for section ${recipeSectionId}`);

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

	if (removedInstructionIds.length > 0) {
		logger.info(`Deleted ${removedInstructionIds.length} instructions for section ${recipeSectionId}`);
	}

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

				logger.info(`Updated instruction ${instData.id}`);
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

				logger.info(`Created instruction ${newInstruction.id} for section ${recipeSectionId}`);

				return newInstruction;
			}
		}),
	);

	logger.info(`Updated ${savedInstructions.length} instructions for section ${recipeSectionId}`);

	return savedInstructions;
}
