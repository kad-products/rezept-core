import { and, eq, isNull, sql } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeInstructions } from '@/models';
import type { RecipeInstructionDBRead, RecipeInstructionWriteInput } from '@/types';

export async function getInstructionsByRecipeSectionId(
	recipeSectionId: string,
	logger: RzLogger,
): Promise<RecipeInstructionDBRead[]> {
	logger.debug(`Fetching instructions for section ${recipeSectionId}`);
	const instructions = await db
		.select()
		.from(recipeInstructions)
		.where(and(eq(recipeInstructions.recipeSectionId, recipeSectionId), isNull(recipeInstructions.deletedAt)));
	logger.debug(`Fetched ${instructions.length} instructions for section ${recipeSectionId}`);
	return instructions.sort((a, b) => a.stepNumber - b.stepNumber);
}

export async function updateRecipeInstructions(
	recipeSectionId: string,
	instructionsData: RecipeInstructionWriteInput[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeInstructionDBRead[]> {
	logger.debug(`Updating instructions for section ${recipeSectionId}`);

	return db.transaction(async tx => {
		// get existing instructions for the section
		const existingInstructions = await tx
			.select()
			.from(recipeInstructions)
			.where(and(eq(recipeInstructions.recipeSectionId, recipeSectionId), isNull(recipeInstructions.deletedAt)));

		// soft-delete removed instructions
		const removedInstructionIds = existingInstructions
			.map(i => i.id)
			.filter(id => !instructionsData.some(idData => idData.id === id));

		await Promise.all(
			removedInstructionIds.map(id =>
				tx
					.update(recipeInstructions)
					.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: userId })
					.where(eq(recipeInstructions.id, id)),
			),
		);

		if (removedInstructionIds.length > 0) {
			logger.info(`Deleted ${removedInstructionIds.length} instructions for section ${recipeSectionId}`);
		}

		// Phase 1: move all existing instructions being updated to temporary negative stepNumbers.
		// This clears the positive number space so Phase 2 can assign final values concurrently
		// without hitting the (recipeSectionId, stepNumber) unique constraint.
		const existingUpdates = instructionsData.filter(i => i.id);
		if (existingUpdates.length > 0) {
			await Promise.all(
				existingUpdates.map((instData, index) =>
					tx
						.update(recipeInstructions)
						.set({ stepNumber: -(index + 1) })
						.where(eq(recipeInstructions.id, instData.id!)),
				),
			);
		}

		// Phase 2: apply final stepNumbers to existing instructions and insert new ones.
		// All existing instructions are now at negative stepNumbers, so no constraint conflicts can occur.
		const savedInstructions = await Promise.all(
			instructionsData.map(async (instData: RecipeInstructionWriteInput) => {
				if (instData.id) {
					const [updatedInstruction] = await tx
						.update(recipeInstructions)
						.set({
							stepNumber: instData.stepNumber,
							instruction: instData.instruction,
							updatedAt: sql`(datetime('now', 'localtime'))`,
							updatedBy: userId,
						})
						.where(eq(recipeInstructions.id, instData.id))
						.returning();

					logger.info(`Updated instruction ${instData.id}`);
					return updatedInstruction;
				} else {
					const [newInstruction] = await tx
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
	});
}
