import { and, eq, isNull, sql } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import db from '@/db';
import { recipeInstructions } from '@/models';
import type { RecipeInstructionDBRead, RecipeInstructionWriteInput, RzLogger } from '@/types';

export async function updateRecipeInstructions(
	recipeSectionId: string,
	instructionsData: RecipeInstructionWriteInput[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeInstructionDBRead[]> {
	logger.debug(`Updating instructions for section ${recipeSectionId}`);

	// get existing instructions for the section (must happen before batch so we know what to mutate)
	const existingInstructions = await db
		.select()
		.from(recipeInstructions)
		.where(and(eq(recipeInstructions.recipeSectionId, recipeSectionId), isNull(recipeInstructions.deletedAt)));

	logger.debug(`Found ${existingInstructions.length} existing instructions for section ${recipeSectionId}`);

	// soft-delete removed instructions
	const removedInstructionIds = existingInstructions
		.map(i => i.id)
		.filter(id => !instructionsData.some(idData => idData.id === id));

	logger.debug(`Soft-deleting ${removedInstructionIds.length} removed instructions for section ${recipeSectionId}`);

	// Phase 1: move all existing instructions being updated to temporary negative stepNumbers.
	// This clears the positive number space so Phase 2 can assign final values without hitting
	// the (recipeSectionId, stepNumber) unique constraint.
	const existingUpdates = instructionsData.filter((i): i is RecipeInstructionWriteInput & { id: string } => i.id !== undefined);

	// All mutations are batched into a single D1 batch call (D1 does not support BEGIN transactions).
	// Statements execute sequentially within the batch, so Phase 1 completes before Phase 2 runs,
	// preserving the two-phase step-number swap. The batch result array mirrors statement order,
	// so we track the counts of each phase to slice out the Phase 2 returning() rows at the end.
	const deleteCount = removedInstructionIds.length;
	const phase1Count = existingUpdates.length;

	const deleteStatements = removedInstructionIds.map(id =>
		db
			.update(recipeInstructions)
			.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: userId })
			.where(eq(recipeInstructions.id, id)),
	) as BatchItem<'sqlite'>[];

	const phase1Statements = existingUpdates.map((instData, index) =>
		db
			.update(recipeInstructions)
			.set({ stepNumber: -(index + 1) })
			.where(eq(recipeInstructions.id, instData.id)),
	) as BatchItem<'sqlite'>[];

	// Phase 2: apply final stepNumbers to existing instructions and insert new ones.
	// All existing instructions are now at negative stepNumbers, so no constraint conflicts can occur.
	const phase2Statements = instructionsData.map(instData => {
		if (instData.id) {
			return db
				.update(recipeInstructions)
				.set({
					stepNumber: instData.stepNumber,
					instruction: instData.instruction,
					updatedAt: sql`(datetime('now', 'localtime'))`,
					updatedBy: userId,
				})
				.where(eq(recipeInstructions.id, instData.id))
				.returning();
		}
		return db
			.insert(recipeInstructions)
			.values({
				recipeSectionId,
				stepNumber: instData.stepNumber,
				instruction: instData.instruction,
				createdBy: userId,
			})
			.returning();
	}) as BatchItem<'sqlite'>[];

	const allStatements = [...deleteStatements, ...phase1Statements, ...phase2Statements];

	if (allStatements.length === 0) {
		return [];
	}

	if (deleteCount > 0) {
		logger.info(`Deleting ${deleteCount} instructions for section ${recipeSectionId}`);
	}
	logger.debug(`Moving ${phase1Count} existing instructions to temporary stepNumbers for section ${recipeSectionId}`);

	const batchResults = await db.batch(allStatements as [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]);

	if (deleteCount > 0) {
		logger.info(`Deleted ${deleteCount} instructions for section ${recipeSectionId}`);
	}

	const phase2Start = deleteCount + phase1Count;
	const savedInstructions = (batchResults.slice(phase2Start) as RecipeInstructionDBRead[][]).flat();

	logger.info(`Updated ${savedInstructions.length} instructions for section ${recipeSectionId}`);
	return savedInstructions;
}
