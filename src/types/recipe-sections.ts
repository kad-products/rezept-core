import type { recipeSections } from '@/models/schema';

export type RecipeSection = typeof recipeSections.$inferSelect;
export type RecipeSectionFormSave = Omit<
	typeof recipeSections.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
