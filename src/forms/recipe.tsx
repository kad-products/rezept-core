'use client';
import { useActionState } from 'react';
import FormField from '@/components/client/FormField';
import { saveRecipe } from '@/functions/recipes';
import type { Recipe as RecipeModel } from '@/models/schema';

export default function Recipe({ recipe }: { recipe?: RecipeModel }) {
	const [state, formAction] = useActionState(saveRecipe, null);

	const buttonText = recipe ? 'Save Recipe' : 'Add Recipe';

	return (
		<form action={formAction}>
			{recipe?.id && (
				<div>
					id:
					<input type="text" name="id" value={recipe.id} />
				</div>
			)}

			{JSON.stringify(recipe, null, 2)}

			<FormField
				label="Title"
				name="title"
				type="text"
				error={state?.errors?.title?.[0]}
				value={recipe?.title}
			/>

			<FormField
				label="Author"
				name="authorId"
				type="text"
				error={state?.errors?.authorId?.[0]}
				value={recipe?.authorId}
			/>

			<FormField
				label="Source"
				name="source"
				type="text"
				error={state?.errors?.source?.[0]}
				value={recipe?.source}
			/>

			<FormField
				label="Servings"
				name="servings"
				type="text"
				error={state?.errors?.servings?.[0]}
				value={recipe?.servings}
			/>

			<FormField
				label="Prep Time (minutes)"
				name="prepTime"
				type="text"
				error={state?.errors?.prepTime?.[0]}
				value={recipe?.prepTime}
			/>

			<FormField
				label="Cook Time (minutes)"
				name="cookTime"
				type="text"
				error={state?.errors?.cookTime?.[0]}
				value={recipe?.cookTime}
			/>

			{state?.errors?._form && <p className="error">{state.errors._form[0]}</p>}

			{state?.success && <p className="success">Recipe saved!</p>}
			<button type="submit">{buttonText}</button>
		</form>
	);
}
