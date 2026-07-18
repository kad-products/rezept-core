import type { WorkflowEvent } from 'cloudflare:workers';
import { WorkflowEntrypoint, type WorkflowStep } from 'cloudflare:workers';
import { createWorkflowLogger } from '@/logger';
import {
	getIngredients,
	getRecipeById,
	getRecipeIngredientsByRecipeSectionId,
	getRecipes,
	getSectionsByRecipeId,
} from '@/repositories';
import { updateRecipeIngredientsWithIngredientIds } from '@/steps';
import type { IngredientDBRead, RecipeDBRead, RecipeIngredientDBRead, RecipeSectionDBRead } from '@/types';

type Params = { recipeId?: string; userId: string };

export class RecipeIngredientsLinkedToIngredientsWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<void> {
		const logger = createWorkflowLogger(event);
		const { recipeId, userId } = event.payload;

		let recipes: RecipeDBRead[] = [];
		await step.do(
			'Fetching all non-deleted recipes',
			{ retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' } },
			async () => {
				if (recipeId) {
					logger.info(`Fetching recipe ${recipeId}`);
					const recipe = await getRecipeById(recipeId, logger);
					recipes.push(recipe);
				} else {
					logger.info(`Fetching all recipes`);
					recipes = await getRecipes({}, 100, 0, logger);
				}

				logger.info(`Found ${recipes.length} recipes`);
			},
		);

		const allRecipeSections: RecipeSectionDBRead[] = [];
		await step.do(
			'Fetching all recipe sections for all the recipes',
			{ retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' } },
			async () => {
				logger.info('Fetching all recipe sections for all the recipes');
				await Promise.all(
					recipes.map(async recipe => {
						const recipeSections = await getSectionsByRecipeId(recipe.id, logger);
						recipeSections.forEach(section => {
							allRecipeSections.push(section);
						});
					}),
				);
				logger.info(`Found ${allRecipeSections.length} sections`);
			},
		);

		const allRecipeIngredients: RecipeIngredientDBRead[] = [];
		await step.do(
			'Fetching all recipe ingredients for all the recipe sections',
			{ retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' } },
			async () => {
				logger.info('Fetching all recipe ingredients for all the recipe sections');
				await Promise.all(
					allRecipeSections.map(async section => {
						const recipeIngredients = await getRecipeIngredientsByRecipeSectionId(section.id, logger);
						recipeIngredients.forEach(ing => {
							allRecipeIngredients.push(ing);
						});
					}),
				);
				logger.info(`Found ${allRecipeIngredients.length} recipe ingredients`);
			},
		);

		// get all verified ingredients
		let verifiedIngredients: IngredientDBRead[] = [];
		await step.do(
			'Fetching all verified ingredients',
			{ retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' } },
			async () => {
				logger.info('Fetching all verified ingredients');
				verifiedIngredients = await getIngredients({ verifiedOnly: true }, logger);
				logger.info(`Found ${verifiedIngredients.length} verified ingredients`);
			},
		);

		// match em up and update em
		await step.do(
			'Creating mapping of recipe ingredient IDs to ingredient IDs',
			{ retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' } },
			async () => {
				logger.info(`Mapping ingredients back to recipe ingredients and updating them`);
				const updatesCompleted = await updateRecipeIngredientsWithIngredientIds(
					allRecipeIngredients,
					verifiedIngredients,
					userId,
					logger,
				);
				logger.info(`Updated ${updatesCompleted.length} recipe ingredients`);
			},
		);
	}
}
