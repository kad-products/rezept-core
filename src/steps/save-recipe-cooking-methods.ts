import { RzStepError } from '@/classes';
import { updateRecipeCookingMethods, updateRecipeInstructions } from '@/repositories';
import type { RecipeSectionCookingMethodsInput, RzLogger } from '@/types';

export async function saveRecipeCookingMethods(
	recipeId: string,
	sectionsData: RecipeSectionCookingMethodsInput[],
	userId: string,
	logger: RzLogger,
): Promise<void> {
	for (const section of sectionsData) {
		try {
			const methodsOnly = section.cookingMethods.map(m => ({ id: m.id, name: m.name, order: m.order }));
			const savedMethods = await updateRecipeCookingMethods(section.sectionId, methodsOnly, userId, logger);

			for (let i = 0; i < savedMethods.length; i++) {
				await updateRecipeInstructions(savedMethods[i].id, section.cookingMethods[i].instructions, userId, logger);
			}

			logger.info(`Saved cooking methods for recipe ${recipeId} section ${section.sectionId}`);
		} catch (error) {
			logger.warn(`Error saving cooking methods for recipe ${recipeId} section ${section.sectionId}: ${error}`);
			throw new RzStepError(
				400,
				'Failed to save recipe cooking methods',
				`Error saving cooking methods for recipe ${recipeId} section ${section.sectionId}: ${error}`,
				false,
				error,
			);
		}
	}
}
