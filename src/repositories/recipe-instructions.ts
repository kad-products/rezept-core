import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import db from '@/db';
import { type RecipeInstruction, type RecipeInstructionFormSave, recipeInstructions } from '@/models/schema';

export const createRecipeInstructionFormValidationSchema = createInsertSchema(recipeInstructions, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	stepNumber: z.coerce.number().min(0).default(0),
	instruction: z.string().min(1, 'Instruction is required'),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});

export async function getInstructionsByRecipeSectionId(recipeSectionId: string): Promise<RecipeInstruction[]> {
	const instructions = await db.select().from(recipeInstructions).where(eq(recipeInstructions.recipeSectionId, recipeSectionId));

	return instructions.sort((a, b) => a.stepNumber - b.stepNumber);
}

export async function updateRecipeInstructions(
	recipeSectionId: string,
	instructionsData: RecipeInstructionFormSave[],
	userId: string,
): Promise<void> {
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
	await Promise.all(
		instructionsData.map(async (instData: RecipeInstructionFormSave) => {
			if (instData.id) {
				// update existing instruction
				await db
					.update(recipeInstructions)
					.set({
						stepNumber: instData.stepNumber,
						instruction: instData.instruction,
						updatedBy: userId,
					})
					.where(eq(recipeInstructions.id, instData.id));

				console.log(`Updated existing instruction ID ${instData.id}: ${JSON.stringify(instData, null, 4)} `);
			} else {
				// insert new instruction
				await db.insert(recipeInstructions).values({
					recipeSectionId: instData.recipeSectionId,
					stepNumber: instData.stepNumber,
					instruction: instData.instruction,
					createdBy: userId,
				});

				console.log(
					`Inserted new instruction for recipeSectionId ${instData.recipeSectionId}: ${JSON.stringify(instData, null, 4)} `,
				);
			}
		}),
	);

	console.log(
		`Updated/Inserted instructions for recipeSectionId ${recipeSectionId}: ${JSON.stringify(instructionsData, null, 4)} `,
	);
}
