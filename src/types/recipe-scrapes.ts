import type { recipeScrapes } from '@/models';

export type ParsedRecipeScrapeSection = {
	order: number;
	ingredients: { raw: string; order: number }[];
	instructions: { stepNumber: number; instruction: string }[];
};

export type ParsedRecipeScrape = {
	title: string;
	description?: string;
	source?: string;
	servings?: number;
	prepTime?: number;
	cookTime?: number;
	sections: ParsedRecipeScrapeSection[];
};

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
export type RecipeScrapeFormData = Omit<
	typeof recipeScrapes.$inferInsert,
	'userId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
