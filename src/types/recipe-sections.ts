import type { recipeSections } from '@/models';

export type RecipeSectionDBRead = typeof recipeSections.$inferSelect;
export type RecipeSectionFormSave = Omit<
	typeof recipeSections.$inferInsert,
	'recipeId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
