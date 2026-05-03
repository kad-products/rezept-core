import type { z } from 'zod';
import type { recipeScrapes } from '@/models';
import type { recipesSchemas } from '@/schemas';

// Output type (post-transform) of the scrape schema — what validateAsRecipe returns.
export type RecipeScrapeData = z.output<typeof recipesSchemas.scrape>;

// should match the model's enum
export type RecipeScrapeStatus =
	| 'SCRAPED'
	| 'TRANSFORMED'
	| 'VALIDATED'
	| 'RECIPE_SAVED'
	| 'SECTIONS_SAVED'
	| 'INGREDIENTS_SAVED'
	| 'INSTRUCTIONS_SAVED'
	| 'COMPLETED'
	| 'FAILED';
export type RecipeScrapeDBRead = typeof recipeScrapes.$inferSelect;
