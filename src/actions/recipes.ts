'use server';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import {
	createRecipe,
	updateRecipe,
	updateRecipeIngredients,
	updateRecipeInstructions,
	updateRecipeSections,
} from '@/repositories';
import { recipesSchemas } from '@/schemas';
import type {
	ActionState,
	RecipeDBRead,
	RecipeFormInput,
	RecipeIngredientDBRead,
	RecipeIngredientWriteInput,
	RecipeInstructionDBRead,
	RecipeInstructionWriteInput,
	RecipeSectionDBRead,
	RecipeSectionWriteInput,
} from '@/types';
import { errorResponse, successResponse } from './utils';

// biome-ignore lint/nursery/useExplicitType: WrappedServerFunction return type is not exported from rwsdk
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

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	const parsed = recipesSchemas.form.safeParse(formData);

	if (parsed.error) {
		return errorResponse<RecipeFormInput>(parsed.error.flatten().fieldErrors, 400);
	}

	requestInfo.ctx.logger.info(`Validated form data: ${JSON.stringify(parsed, null, 4)} `);

	//   ______ _______ _______ _____  _____  _______
	//  |_____/ |______ |         |   |_____] |______
	//  |    \_ |______ |_____  __|__ |       |______
	//
	let recipe: RecipeDBRead;
	try {
		if (parsed.data.id) {
			recipe = await updateRecipe(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
		} else {
			recipe = await createRecipe(parsed.data, userId, requestInfo.ctx.logger);
		}
		requestInfo.ctx.logger.info(`Recipe ${recipe.id} saved`);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving recipe: ${error} `);
		return errorResponse<RecipeFormInput>(error, 400, 'Failed to save recipe');
	}

	//  _______ _______ _______ _______ _____  _____  __   _ _______
	//  |______ |______ |          |      |   |     | | \  | |______
	//  ______| |______ |_____     |    __|__ |_____| |  \_| ______|
	//
	let sections: RecipeSectionDBRead[];
	try {
		sections = await updateRecipeSections(
			recipe.id,
			parsed.data.sections as RecipeSectionWriteInput[],
			userId,
			requestInfo.ctx.logger,
		);
		requestInfo.ctx.logger.info(`Recipe sections saved for ${recipe.id}: ${JSON.stringify(sections, null, 4)}`);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving sections: ${error} `);
		return errorResponse<RecipeFormInput>(error, 400, 'Failed to save recipe sections');
	}

	//  _____ __   _ _______ _______  ______ _     _ _______ _______ _____  _____  __   _ _______
	//    |   | \  | |______    |    |_____/ |     | |          |      |   |     | | \  | |______
	//  __|__ |  \_| ______|    |    |    \_ |_____| |_____     |    __|__ |_____| |  \_| ______|
	//
	// remove instructions with empty instruction text and no id, we assume that means it is the empty "new instruction" field
	const savedInstructions: Record<string, RecipeInstructionDBRead[]> = {};
	for (const [index, section] of (parsed.data.sections || []).entries()) {
		// use the saved section so we can ensure it has an ID (wouldn't be in the incoming data for a new section)
		const savedSection = sections[index];
		try {
			savedInstructions[savedSection.id] = await updateRecipeInstructions(
				savedSection.id,
				section.instructions as RecipeInstructionWriteInput[],
				userId,
				requestInfo.ctx.logger,
			);
			requestInfo.ctx.logger.info(`Recipe instructions saved for recipe ${recipe.id} section ${savedSection.id}`);
		} catch (error) {
			requestInfo.ctx.logger.info(`Error saving section instructions: ${error} `);
			return errorResponse<RecipeFormInput>(error, 400, 'Failed to save recipe instructions');
		}
	}

	//  _____ __   _  ______  ______ _______ ______  _____ _______ __   _ _______ _______
	//    |   | \  | |  ____ |_____/ |______ |     \   |   |______ | \  |    |    |______
	//  __|__ |  \_| |_____| |    \_ |______ |_____/ __|__ |______ |  \_|    |    ______|
	//
	// remove ingredients with empty ingredientId and no id, we assume that means it is the empty "new ingredient" field
	const savedIngredients: Record<string, RecipeIngredientDBRead[]> = {};
	for (const [index, section] of (parsed.data.sections || []).entries()) {
		// use the saved section so we can ensure it has an ID (wouldn't be in the incoming data for a new section)
		const savedSection = sections[index];
		try {
			savedIngredients[savedSection.id] = await updateRecipeIngredients(
				savedSection.id,
				section.ingredients as RecipeIngredientWriteInput[],
				userId,
				requestInfo.ctx.logger,
			);
			requestInfo.ctx.logger.info(`Recipe ingredients saved for recipe ${recipe.id} section ${section.id}`);
		} catch (error) {
			requestInfo.ctx.logger.info(`Error saving section ingredients: ${error} `);
			return errorResponse<RecipeFormInput>(error, 400, 'Failed to save recipe ingredients');
		}
	}

	return successResponse<RecipeFormInput>(
		{
			...recipe,
			sections: sections?.map(s => ({
				...s,
				instructions: savedInstructions[s.id],
				ingredients: savedIngredients[s.id],
			})),
		} as unknown as RecipeFormInput,
		200,
	);
}
