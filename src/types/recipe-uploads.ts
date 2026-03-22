import type { recipeUploads } from '@/models';

export type RecipeUpload = typeof recipeUploads.$inferSelect;
export type RecipeUploadFormData = Omit<
	typeof recipeUploads.$inferInsert,
	'userId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
