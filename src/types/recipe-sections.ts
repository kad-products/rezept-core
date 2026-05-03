import type { recipeSections } from '@/models';

export type RecipeSectionDBRead = typeof recipeSections.$inferSelect;
export type RecipeSectionWriteInput = Omit<
	typeof recipeSections.$inferInsert,
	'recipeId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type ParsedRecipeScrapeSection = {
	order: number;
	ingredients: { raw: string; order: number }[];
	instructions: { stepNumber: number; instruction: string }[];
};
