import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, successResponse } from '@/api/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createRecipeScrapeAttempt, linkRecipeScrapeToRecipe, updateRecipeScrapeStatus } from '@/repositories';
import {
	fetchAndStoreCoverImage,
	initializeScrape,
	parseBodyJson,
	saveRecipe,
	saveRecipeIngredients,
	saveRecipeInstructions,
	saveRecipeSections,
	transformScrapeToRecipe,
	validateAsRecipe,
} from '@/steps';
import type { RecipeScrapeDBRead } from '@/types';

export default {
	post: [requireAuthentication, requirePermissions('recipes:scrape'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ request, ctx }: RequestInfo<DefaultAppContext>): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;

	let recipeScrape: RecipeScrapeDBRead | undefined;
	try {
		const parsedBodyJson = await parseBodyJson(request);

		recipeScrape = await initializeScrape(parsedBodyJson, userId, ctx.logger);

		const transformedRecipe = await transformScrapeToRecipe(parsedBodyJson, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrape.id, 'TRANSFORMED', null, userId, ctx.logger);

		// Non-fatal: image fetch failure logs and returns null rather than failing the scrape
		const coverImage = await fetchAndStoreCoverImage(transformedRecipe.coverImage, userId, ctx.logger);

		const validatedRecipe = await validateAsRecipe(transformedRecipe, userId, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrape.id, 'VALIDATED', null, userId, ctx.logger);

		const savedRecipe = await saveRecipe({ ...validatedRecipe, coverImageId: coverImage?.id ?? null }, userId, ctx.logger);
		await linkRecipeScrapeToRecipe(recipeScrape.id, savedRecipe.id, userId, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrape.id, 'RECIPE_SAVED', null, userId, ctx.logger);

		const savedSections = await saveRecipeSections(savedRecipe.id, validatedRecipe.sections, userId, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrape.id, 'SECTIONS_SAVED', null, userId, ctx.logger);

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
		await updateRecipeScrapeStatus(recipeScrape.id, 'INSTRUCTIONS_SAVED', null, userId, ctx.logger);

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
		await updateRecipeScrapeStatus(recipeScrape.id, 'INGREDIENTS_SAVED', null, userId, ctx.logger);

		recipeScrape = await updateRecipeScrapeStatus(recipeScrape.id, 'COMPLETED', null, userId, ctx.logger);
		await createRecipeScrapeAttempt(recipeScrape.id, 'api', null, 'COMPLETED', null, null, userId, ctx.logger);
	} catch (err) {
		if (recipeScrape) {
			await updateRecipeScrapeStatus(recipeScrape.id, 'FAILED', (err as Error).message, userId, ctx.logger);
			await createRecipeScrapeAttempt(recipeScrape.id, 'api', null, 'FAILED', (err as Error).message, null, userId, ctx.logger);
		}
		return apiErrorResponse(err, 'Error processing recipe scrape');
	}

	return successResponse(recipeScrape);
}
