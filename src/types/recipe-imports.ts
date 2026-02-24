import type { recipeImports } from '@/models';

export type RecipeImport = typeof recipeImports.$inferSelect;
export type RecipeImportFormData = Omit<
	typeof recipeImports.$inferInsert,
	'userId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
