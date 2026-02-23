'use server';

import { env } from 'cloudflare:workers';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requirePermissions } from '@/middleware/permissions';
import { updateRecipeIngredients } from '@/repositories/recipe-ingredients';
import { updateRecipeInstructions } from '@/repositories/recipe-instructions';
import { updateRecipeSections } from '@/repositories/recipe-sections';
import { createRecipe, updateRecipe } from '@/repositories/recipes';
import { recipeFormSchema } from '@/schemas';

import type {
	ActionState,
	Recipe,
	RecipeFormData,
	RecipeIngredient,
	RecipeIngredientFormSave,
	RecipeInstruction,
	RecipeInstructionFormSave,
	RecipeSection,
	RecipeSectionFormSave,
} from '@/types';

export const saveRecipe = serverAction([requirePermissions('seasons:create', 'seasons:update'), _saveRecipe]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveRecipe(formData: RecipeFormData): Promise<ActionState<RecipeFormData>> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	const parsed = recipeFormSchema.safeParse(formData);

	if (parsed.error) {
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	requestInfo.ctx.logger.info(`Validated form data: ${JSON.stringify(parsed, null, 4)} `);

	//   ______ _______ _______ _____  _____  _______
	//  |_____/ |______ |         |   |_____] |______
	//  |    \_ |______ |_____  __|__ |       |______
	//
	let recipe: Recipe;
	try {
		if (parsed.data.id) {
			recipe = await updateRecipe(parsed.data.id, parsed.data, userId);
		} else {
			recipe = await createRecipe(parsed.data, userId);
		}
		requestInfo.ctx.logger.info(`Recipe ${recipe.id} saved`);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving recipe: ${error} `);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}

	//  _______ _______ _______ _______ _____  _____  __   _ _______
	//  |______ |______ |          |      |   |     | | \  | |______
	//  ______| |______ |_____     |    __|__ |_____| |  \_| ______|
	//
	let sections: RecipeSection[];
	try {
		sections = await updateRecipeSections(recipe.id, parsed.data.sections as RecipeSectionFormSave[], userId);
		requestInfo.ctx.logger.info(`Recipe sections saved for ${recipe.id}: ${JSON.stringify(sections, null, 4)}`);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving sections: ${error} `);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}

	//  _____ __   _ _______ _______  ______ _     _ _______ _______ _____  _____  __   _ _______
	//    |   | \  | |______    |    |_____/ |     | |          |      |   |     | | \  | |______
	//  __|__ |  \_| ______|    |    |    \_ |_____| |_____     |    __|__ |_____| |  \_| ______|
	//
	// remove instructions with empty instruction text and no id, we assume that means it is the empty "new instruction" field
	const savedInstructions: Record<string, RecipeInstruction[]> = {};
	for (const [index, section] of (parsed.data.sections || []).entries()) {
		// use the saved section so we can ensure it has an ID (wouldn't be in the incoming data for a new section)
		const savedSection = sections[index];
		try {
			savedInstructions[savedSection.id] = await updateRecipeInstructions(
				savedSection.id,
				section.instructions as RecipeInstructionFormSave[],
				userId,
			);
			requestInfo.ctx.logger.info(`Recipe instructions saved for recipe ${recipe.id} section ${savedSection.id}`);
		} catch (error) {
			requestInfo.ctx.logger.info(`Error saving section instructions: ${error} `);

			const errorMessage =
				env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

			return {
				success: false,
				errors: { _form: [errorMessage] },
			};
		}
	}

	//  _____ __   _  ______  ______ _______ ______  _____ _______ __   _ _______ _______
	//    |   | \  | |  ____ |_____/ |______ |     \   |   |______ | \  |    |    |______
	//  __|__ |  \_| |_____| |    \_ |______ |_____/ __|__ |______ |  \_|    |    ______|
	//
	// remove ingredients with empty ingredientId and no id, we assume that means it is the empty "new ingredient" field
	const savedIngredients: Record<string, RecipeIngredient[]> = {};
	for (const [index, section] of (parsed.data.sections || []).entries()) {
		// use the saved section so we can ensure it has an ID (wouldn't be in the incoming data for a new section)
		const savedSection = sections[index];
		try {
			savedIngredients[savedSection.id] = await updateRecipeIngredients(
				savedSection.id,
				section.ingredients as RecipeIngredientFormSave[],
				userId,
			);
			requestInfo.ctx.logger.info(`Recipe ingredients saved for recipe ${recipe.id} section ${section.id}`);
		} catch (error) {
			requestInfo.ctx.logger.info(`Error saving section ingredients: ${error} `);

			const errorMessage =
				env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

			return {
				success: false,
				errors: { _form: [errorMessage] },
			};
		}
	}

	return {
		success: true,
		data: {
			...recipe,
			sections: sections?.map(s => ({
				...s,
				instructions: savedInstructions[s.id],
				ingredients: savedIngredients[s.id],
			})),
		} as RecipeFormData,
	};
}
