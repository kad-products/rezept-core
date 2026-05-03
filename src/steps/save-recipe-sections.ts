import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { updateRecipeSections } from '@/repositories';
import type { RecipeSectionDBRead, RecipeSectionFormSave } from '@/types';

export async function saveRecipeSections(
	recipeId: string,
	sectionsData: RecipeSectionFormSave[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeSectionDBRead[]> {
	let sections: RecipeSectionDBRead[];
	try {
		sections = await updateRecipeSections(recipeId, sectionsData, userId, logger);
		logger.info(`Saved ${sections.length} sections for recipe ${recipeId}`);
	} catch (error) {
		logger.warn(`Error saving sections for recipe ${recipeId}: ${error}`);
		throw new RzStepError(400, 'Failed to save recipe sections', `Error saving sections for recipe ${recipeId}: ${error}`);
	}
	return sections;
}
