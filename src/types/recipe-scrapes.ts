import type { recipeScrapes } from '@/models';

export type RecipeScrapeStatus = 'SCRAPED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
export type RecipeScrape = typeof recipeScrapes.$inferSelect;
export type RecipeScrapeFormData = Omit<
	typeof recipeScrapes.$inferInsert,
	'userId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
