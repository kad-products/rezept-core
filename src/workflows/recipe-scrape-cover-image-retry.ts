import type { WorkflowEvent } from 'cloudflare:workers';
import { WorkflowEntrypoint, type WorkflowStep } from 'cloudflare:workers';
import { createWorkflowLogger } from '@/logger';
import { getRecipeScrapeById, updateRecipeCoverImage } from '@/repositories';
import { fetchAndStoreCoverImage } from '@/steps';
import type { ParsedRecipeScrapeImage } from '@/types/recipes';

type Params = { coverImage: ParsedRecipeScrapeImage; recipeScrapeId: string; userId: string };

export class RecipeScrapeCoverImageRetryWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<void> {
		const logger = createWorkflowLogger(event);
		const { coverImage, recipeScrapeId, userId } = event.payload;

		await step.sleep('initial delay', '5 seconds');

		const result = await step.do(
			'fetch and store cover image',
			{ retries: { limit: 3, delay: '10 seconds', backoff: 'exponential' } },
			async () => {
				return await fetchAndStoreCoverImage(coverImage, userId, logger);
			},
		);

		if (!result) {
			logger.info(`Cover image retry failed after maximum attempts for scrape ${recipeScrapeId}`);
			return;
		}

		await step.do(
			'Update recipe with cover image',
			{ retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' } },
			async () => {
				const scrape = await getRecipeScrapeById(recipeScrapeId, logger);

				if (!scrape.recipeId) {
					logger.warn(`Scrape ${recipeScrapeId} has no associated recipe, cannot link cover image`);
					return;
				}

				const updatedRecipe = await updateRecipeCoverImage(scrape.recipeId, result.id, userId, logger);

				logger.info(`Successfully updated recipe ${updatedRecipe.id} with cover image ${result.id} for scrape ${recipeScrapeId}`);
			},
		);
	}
}
