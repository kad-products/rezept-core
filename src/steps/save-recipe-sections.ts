import { env } from 'cloudflare:workers';
import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { updateRecipeSections } from '@/repositories/recipe-sections';
import type { RecipeSection, RecipeSectionFormSave } from '@/types';

export async function saveRecipeSections(
	recipeId: string,
	sectionsData: RecipeSectionFormSave[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeSection[]> {
	let sections: RecipeSection[];
	try {
		sections = await updateRecipeSections(recipeId, sectionsData, userId, logger);
		logger.info(`Recipe sections saved for ${recipeId}: ${JSON.stringify(sections, null, 4)}`);
	} catch (error) {
		logger.info(`Error saving sections: ${error} `);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

		throw new RzStepError(400, errorMessage);
	}
	return sections;
}
