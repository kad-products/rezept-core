import type { recipeScrapes } from '@/models';

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
export type RecipeScrape = typeof recipeScrapes.$inferSelect;
export type RecipeScrapeFormData = Omit<
	typeof recipeScrapes.$inferInsert,
	'userId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
