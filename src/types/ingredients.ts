import type { ingredients } from '@/models/schema';

export type Ingredient = typeof ingredients.$inferSelect;
export type IngredientFormSave = Omit<
	typeof ingredients.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
