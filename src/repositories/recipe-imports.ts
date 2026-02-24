import { requestInfo } from 'rwsdk/worker';
import db from '@/db';
import { recipeImports } from '@/models';
import type { RecipeImportFormData } from '@/types';

export async function createRecipeImport(recipeImport: RecipeImportFormData, userId: string) {
	requestInfo.ctx.logger.info(`Form data in createRecipeImport: ${JSON.stringify(recipeImport, null, 4)} `);

	const recipesImported = await db
		.insert(recipeImports)
		.values({
			...recipeImport,
			userId,
			createdBy: userId,
		})
		.returning();

	return recipesImported[0];
}
