import { eq } from 'drizzle-orm';
import { requestInfo } from 'rwsdk/worker';
import db from '@/db';
import { recipeImports } from '@/models';
import type { RecipeImport, RecipeImportFormData } from '@/types';
import { validateUuid } from '@/utils';

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

export async function getRecipeImports() {
	if (!requestInfo.ctx.user) {
		return [];
	}

	return await db.select().from(recipeImports).where(eq(recipeImports.userId, requestInfo.ctx.user.id));
}

export async function getRecipeImportById(recipeImportId: string): Promise<RecipeImport> {
	if (!validateUuid(recipeImportId)) {
		throw new Error(`Invalid id: ${recipeImportId}`);
	}

	const matchedRecipeImports = await db.select().from(recipeImports).where(eq(recipeImports.id, recipeImportId));

	if (matchedRecipeImports.length !== 1) {
		throw new Error(
			`getRecipeImportById: matchedRecipeImports length is ${matchedRecipeImports.length} for id ${recipeImportId}`,
		);
	}

	return matchedRecipeImports[0];
}
