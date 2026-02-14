import type { recipes } from '@/models/recipes';

export type Recipe = typeof recipes.$inferSelect;
export type RecipeFormSave = Omit<
	typeof recipes.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
