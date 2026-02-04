'use server';

import { env } from 'cloudflare:workers';
import { requestInfo } from 'rwsdk/worker';
import type { RecipeIngredient, RecipeIngredientFormSave } from '@/models/recipe-ingredients';
import type { RecipeInstruction, RecipeInstructionFormSave } from '@/models/recipe-instructions';
import type { RecipeSection, RecipeSectionFormSave } from '@/models/recipe-sections';

import { createRecipeIngredientFormValidationSchema, updateRecipeIngredients } from '@/repositories/recipe-ingredients';
import { createRecipeInstructionFormValidationSchema, updateRecipeInstructions } from '@/repositories/recipe-instructions';
import { createRecipeSectionFormValidationSchema, updateSectionsForRecipe } from '@/repositories/recipe-sections';
import { createRecipe, createRecipeFormValidationSchema, updateRecipe } from '@/repositories/recipes';
import type { ActionState } from '@/types';
import { extractErrors, formDataToObject, validateFormDataSingular } from '@/utils/forms';

export async function saveRecipe(_prevState: ActionState, formData: FormData): Promise<ActionState> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	const formDataObj = formDataToObject(formData);

	console.log(`Form data received: ${JSON.stringify(formDataObj, null, 4)} `);

	const parsed = createRecipeFormValidationSchema.safeParse(formDataObj);

	console.log(`Form data received: ${JSON.stringify(parsed, null, 4)} `);

	if (!parsed.success) {
		console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	try {
		let recipeId: string = parsed.data.id || '';
		if (!parsed.data.id) {
			const [newRecipe] = await createRecipe(parsed.data, userId);
			recipeId = newRecipe.id;
		} else {
			await updateRecipe(parsed.data.id, parsed.data, userId);
		}

		//  _______ _______ _______ _______ _____  _____  __   _ _______
		//  |______ |______ |          |      |   |     | | \  | |______
		//  ______| |______ |_____     |    __|__ |_____| |  \_| ______|
		//
		const sectionValidationResults = (formDataObj.sections as RecipeSection[]).map((s: RecipeSection, sectionIdx: number) =>
			validateFormDataSingular({ ...s, recipeId }, createRecipeSectionFormValidationSchema, `sections.${sectionIdx}.`),
		);
		const sectionErrors = extractErrors(sectionValidationResults);

		console.log(`Section validation results: ${JSON.stringify(sectionValidationResults, null, 4)}`);

		if (sectionErrors) {
			return {
				success: false,
				errors: sectionErrors,
			};
		}

		const sections: RecipeSectionFormSave[] = sectionValidationResults
			.map(r => r.data)
			.filter(Boolean) as RecipeSectionFormSave[];

		await updateSectionsForRecipe(recipeId, sections, userId);

		//  _____ __   _ _______ _______  ______ _     _ _______ _______ _____  _____  __   _ _______
		//    |   | \  | |______    |    |_____/ |     | |          |      |   |     | | \  | |______
		//  __|__ |  \_| ______|    |    |    \_ |_____| |_____     |    __|__ |_____| |  \_| ______|
		//
		// remove instructions with empty instruction text and no id, we assume that means it is the empty "new instruction" field
		formDataObj.instructions = (formDataObj.instructions as RecipeInstruction[]).filter(
			(inst: RecipeInstruction) => inst.instruction.trim() !== '' || inst.id,
		);

		const instructionsValidationResults = (formDataObj.instructions as RecipeInstruction[]).map(
			(i: RecipeInstruction, instIdx: number) =>
				validateFormDataSingular(i, createRecipeInstructionFormValidationSchema, `instructions.${instIdx}.`),
		);
		const instructionErrors = extractErrors(instructionsValidationResults);

		console.log(`Instruction validation results: ${JSON.stringify(instructionsValidationResults, null, 4)}`);

		if (instructionErrors) {
			return {
				success: false,
				errors: instructionErrors,
			};
		}

		const instructions: RecipeInstructionFormSave[] = instructionsValidationResults
			.map(r => r.data)
			.filter(Boolean) as RecipeInstructionFormSave[];

		await updateRecipeInstructions(recipeId, instructions, userId);

		//  _____ __   _  ______  ______ _______ ______  _____ _______ __   _ _______ _______
		//    |   | \  | |  ____ |_____/ |______ |     \   |   |______ | \  |    |    |______
		//  __|__ |  \_| |_____| |    \_ |______ |_____/ __|__ |______ |  \_|    |    ______|
		//
		// remove ingredients with empty ingredientId and no id, we assume that means it is the empty "new ingredient" field
		// TODO: remove the --- select ingredient --- string from this
		formDataObj.ingredients = (formDataObj.ingredients as RecipeIngredient[]).filter(
			(ing: RecipeIngredient) => ing.ingredientId !== '--- select ingredient ---' || ing.id,
		);

		const ingredientsValidationResults = (formDataObj.ingredients as RecipeIngredient[]).map(
			(i: RecipeIngredient, ingIdx: number) =>
				validateFormDataSingular(i, createRecipeIngredientFormValidationSchema, `ingredients.${ingIdx}.`),
		);

		const ingredientErrors = extractErrors(ingredientsValidationResults);

		console.log(`Ingredient validation results: ${JSON.stringify(ingredientsValidationResults, null, 4)}`);

		if (ingredientErrors) {
			return {
				success: false,
				errors: ingredientErrors,
			};
		}

		const ingredients: RecipeIngredientFormSave[] = ingredientsValidationResults
			.map(r => r.data)
			.filter(Boolean) as RecipeIngredientFormSave[];

		await updateRecipeIngredients(recipeId, ingredients, userId);

		return { success: true };
	} catch (error) {
		console.log(`Error saving recipe: ${error} `);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save recipe';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}
}
