import type { WorkflowEvent } from 'cloudflare:workers';
import { WorkflowEntrypoint, type WorkflowStep } from 'cloudflare:workers';
import { createWorkflowLogger } from '@/logger';
import {
	getRecipeById,
	getRecipeIngredientsByRecipeSectionId,
	getRecipes,
	getSectionsByRecipeId,
	saveIngredients,
} from '@/repositories';
import { parseRawIngredients } from '@/steps';
import type { RecipeDBRead, RecipeIngredientDBRead, RecipeSectionDBRead } from '@/types';

type Params = { recipeId?: string; userId: string };

export class RecipeRawIngredientsToIngredientsWorkflow extends WorkflowEntrypoint<Env, Params> {
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

		let parsedIngredients: string[] = [];
		await step.do(
			'Parse recipe ingredients down to actual purchaseable ingredients',
			{ retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' } },
			async () => {
				logger.info('Parsing recipe ingredients into just ingredients');
				parsedIngredients = await parseRawIngredients(allRecipeIngredients, logger);
				logger.info(`Found ${parsedIngredients.length} ingredients`);
			},
		);

		await step.do(
			'Save parsed ingredients to D1 table',
			{ retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' } },
			async () => {
				logger.info('Saving ingredients list to D1');

				const ingredients = await saveIngredients(parsedIngredients, userId, logger);
				logger.info(`Saved ${ingredients.length} ingredients`);
			},
		);
	}
}
