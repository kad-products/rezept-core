'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { RzStepError } from '@/classes';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { recipesSchemas } from '@/schemas';
import { saveRecipeIngredients, saveRecipeInstructions, saveRecipeSections, saveRecipe as saveRecipeStep } from '@/steps';
import type {
	ActionState,
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

		const instructionsData = savedSections.map((savedSection, index) => ({
			sectionId: savedSection.id,
			instructions: (parsed.data.sections?.[index]?.instructions ?? []) as RecipeInstructionWriteInput[],
		}));
		const savedInstructions = await saveRecipeInstructions(recipe.id, instructionsData, userId, logger);

		const ingredientsData = savedSections.map((savedSection, index) => ({
			sectionId: savedSection.id,
			ingredients: (parsed.data.sections?.[index]?.ingredients ?? []) as RecipeIngredientWriteInput[],
		}));
		const savedIngredients = await saveRecipeIngredients(recipe.id, ingredientsData, userId, logger);

		return successResponse<RecipeFormInput>(
			{
				...recipe,
				sections: savedSections.map(s => ({
					...s,
					instructions: savedInstructions[s.id],
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
