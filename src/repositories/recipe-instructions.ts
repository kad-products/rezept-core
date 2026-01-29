import { eq } from 'drizzle-orm';
import db from '@/db';
import { type RecipeInstruction, recipeInstructions } from '@/models/schema';

export async function getInstructionsByRecipeSectionId(
	recipeSectionId: string,
): Promise<RecipeInstruction[]> {
	const instructions = await db
		.select()
		.from(recipeInstructions)
		.where(eq(recipeInstructions.recipeSectionId, recipeSectionId));

	return instructions.sort((a, b) => a.stepNumber - b.stepNumber);
}
