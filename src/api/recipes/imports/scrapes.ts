import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { requireAuthentication } from '@/interrupters';
import { requirePermissions } from '@/middleware/permissions';
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
import rzStepErrorToJsonResponse from '@/utils/rz-step-error-to-json-response';

export default {
	post: [requireAuthentication, requirePermissions('recipes:scrape'), postHandler] as const,
};

async function postHandler({ request, ctx }: RequestInfo<DefaultAppContext>) {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;

	let recipeScrapeId: string | undefined;
	try {
		const parsedBodyJson = await parseBodyJson(request);

		recipeScrapeId = await initializeScrape(parsedBodyJson, userId);

		const transformedRecipe = await transformScrapeToRecipe(parsedBodyJson, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrapeId, 'TRANSFORMED', 'Transformed payload to recipe', userId);

		const validatedRecipe = await validateAsRecipe(transformedRecipe, userId, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrapeId, 'VALIDATED', 'Validated transformed payload as saveable recipe', userId);

		const savedRecipe = await saveRecipe(validatedRecipe, userId, ctx.logger);
		await updateRecipeScrapeStatus(recipeScrapeId, 'RECIPE_SAVED', 'Saved base recipe entity successfully', userId);

		const savedSections = await saveRecipeSections(
			savedRecipe.id,
			validatedRecipe.sections, // as RecipeSectionFormSave[], // ignores the ingredients and instructions data that doesn't match types
			userId,
			ctx.logger,
		);
		await updateRecipeScrapeStatus(recipeScrapeId, 'SECTIONS_SAVED', 'Saved recipe sections successfully', userId);

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
		await updateRecipeScrapeStatus(recipeScrapeId, 'INSTRUCTIONS_SAVED', 'Saved recipe sections successfully', userId);

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
		await updateRecipeScrapeStatus(recipeScrapeId, 'INGREDIENTS_SAVED', 'Saved recipe sections successfully', userId);
	} catch (err) {
		if (recipeScrapeId) {
			await updateRecipeScrapeStatus(recipeScrapeId, 'FAILED', (err as Error).message, userId);
		}
		return rzStepErrorToJsonResponse(err);
	}

	return Response.json({ success: true });
}
