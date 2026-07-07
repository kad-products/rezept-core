'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { RzStepError } from '@/classes';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { recipesSchemas } from '@/schemas';
import { saveRecipeCookingMethods, saveRecipeIngredients, saveRecipeSections, saveRecipe as saveRecipeStep } from '@/steps';
import type {
	ActionState,
	RecipeCookingMethodWriteInput,
	RecipeFormInput,
	RecipeIngredientWriteInput,
	RecipeInstructionWriteInput,
	RecipeSectionWriteInput,
} from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveRecipe = serverAction([
	requireAuthentication,
	requirePermissions('recipes:create', 'recipes:update'),
	_saveRecipe,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveRecipe(formData: RecipeFormInput): Promise<ActionState<RecipeFormInput>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;
	const logger = ctx.logger;

	const parsed = recipesSchemas.form.safeParse(formData);
	if (parsed.error) {
		return errorResponse<RecipeFormInput>(parsed.error.flatten().fieldErrors, 400);
	}

	try {
		const recipe = await saveRecipeStep(parsed.data, userId, logger);

		const savedSections = await saveRecipeSections(
			recipe.id,
			(parsed.data.sections ?? []) as RecipeSectionWriteInput[],
			userId,
			logger,
		);

		const cookingMethodsData = savedSections.map((savedSection, index) => ({
			sectionId: savedSection.id,
			cookingMethods: (parsed.data.sections?.[index]?.cookingMethods ?? []) as (RecipeCookingMethodWriteInput & {
				instructions: RecipeInstructionWriteInput[];
			})[],
		}));
		await saveRecipeCookingMethods(recipe.id, cookingMethodsData, userId, logger);

		const ingredientsData = savedSections.map((savedSection, index) => ({
			sectionId: savedSection.id,
			ingredients: (parsed.data.sections?.[index]?.ingredients ?? []) as RecipeIngredientWriteInput[],
		}));
		const savedIngredients = await saveRecipeIngredients(recipe.id, ingredientsData, userId, logger);

		return successResponse<RecipeFormInput>(
			{
				...recipe,
				sections: savedSections.map((s, index) => ({
					...s,
					cookingMethods: parsed.data.sections?.[index]?.cookingMethods ?? [],
					ingredients: savedIngredients[s.id],
				})),
			} as unknown as RecipeFormInput,
			200,
		);
	} catch (error) {
		if (error instanceof RzStepError) {
			return errorResponse<RecipeFormInput>(error, error.code, error.publicMessage);
		}
		return errorResponse<RecipeFormInput>(error, 500, 'Failed to save recipe');
	}
}
