import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, successResponse } from '@/api/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { updateRecipeScrapeStatus } from '@/repositories/recipe-scrapes';
import {
	initializeScrape,
	parseBodyJson,
	saveRecipe,
	saveRecipeIngredients,
	saveRecipeInstructions,
	saveRecipeSections,
	transformScrapeToRecipe,
	validateAsRecipe,
} from '@/steps';
import type { RecipeScrape } from '@/types';

export default {
	post: [requireAuthentication, requirePermissions('recipes:scrape'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ request, ctx }: RequestInfo<DefaultAppContext>): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;

	let recipeScrape: RecipeScrape | undefined;
	try {
		const parsedBodyJson = await parseBodyJson(request);

		recipeScrape = await initializeScrape(parsedBodyJson, userId, ctx.logger);

		const transformedRecipe = await transformScrapeToRecipe(parsedBodyJson, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrape.id, 'TRANSFORMED', 'Transformed payload to recipe', userId, ctx.logger);

		const validatedRecipe = await validateAsRecipe(transformedRecipe, userId, ctx.logger);
		await updateRecipeScrapeStatus(
			recipeScrape.id,
			'VALIDATED',
			'Validated transformed payload as saveable recipe',
			userId,
			ctx.logger,
		);

		const savedRecipe = await saveRecipe(validatedRecipe, userId, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrape.id, 'RECIPE_SAVED', 'Saved base recipe entity successfully', userId, ctx.logger);

		const savedSections = await saveRecipeSections(
			savedRecipe.id,
			validatedRecipe.sections, // as RecipeSectionFormSave[], // ignores the ingredients and instructions data that doesn't match types
			userId,
			ctx.logger,
		);
		await updateRecipeScrapeStatus(recipeScrape.id, 'SECTIONS_SAVED', 'Saved recipe sections successfully', userId, ctx.logger);

		const instructionsData = Array.from(
			validatedRecipe.sections.entries().map(([index, section]) => {
				const savedSection = savedSections[index];
				return {
					sectionId: savedSection.id,
					instructions: section.instructions,
				};
			}),
		);
		await saveRecipeInstructions(savedRecipe.id, instructionsData, userId, ctx.logger);
		await updateRecipeScrapeStatus(
			recipeScrape.id,
			'INSTRUCTIONS_SAVED',
			'Saved recipe sections successfully',
			userId,
			ctx.logger,
		);

		const ingredientsData = Array.from(
			validatedRecipe.sections.entries().map(([index, section]) => {
				const savedSection = savedSections[index];
				return {
					sectionId: savedSection.id,
					ingredients: section.ingredients,
				};
			}),
		);
		await saveRecipeIngredients(savedRecipe.id, ingredientsData, userId, ctx.logger);
		recipeScrape = await updateRecipeScrapeStatus(
			recipeScrape.id,
			'INGREDIENTS_SAVED',
			'Saved recipe sections successfully',
			userId,
			ctx.logger,
		);
	} catch (err) {
		if (recipeScrape) {
			await updateRecipeScrapeStatus(recipeScrape.id, 'FAILED', (err as Error).message, userId, ctx.logger);
		}
		return apiErrorResponse(err, 'Error processing recipe scrape');
	}

	return successResponse(recipeScrape);
}
