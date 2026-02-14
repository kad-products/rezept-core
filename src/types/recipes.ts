import type { recipes } from '@/models/schema';

export type Recipe = typeof recipes.$inferSelect;
export type RecipeFormSave = Omit<
	typeof recipes.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
