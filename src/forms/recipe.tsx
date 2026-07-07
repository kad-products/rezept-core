'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveRecipe } from '@/actions/recipes';
import { recipesSchemas } from '@/schemas';
import type { ActionState, IngredientDBRead, RecipeFormInput, RecipeWithSections } from '@/types';
import { useAppForm } from './setup/context';
import { FormDevtools } from './setup/FormDevtools';

export default function RecipeForm({
	recipe,
	allIngredients,
	currentUserId,
}: {
	recipe?: RecipeWithSections;
	allIngredients?: IngredientDBRead[];
	currentUserId: string | undefined;
}): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<RecipeFormInput>>();

	const newRecipeDefaults = {
		title: '',
		sections: [],
		authorId: currentUserId,
	};

	const form = useAppForm({
		formId: 'recipe',
		defaultValues: (recipe ? recipe : newRecipeDefaults) as RecipeFormInput,
		validators: {
			onBlur: recipesSchemas.form,
		},
		onSubmit: async ({ value: formDataObj }: { value: RecipeFormInput }): Promise<void> => {
			setFormState(await saveRecipe(formDataObj));
		},
	});

	const buttonText = recipe ? 'Save Recipe' : 'Add Recipe';

	return (
		<>
			<Form.Root
				className="rz-form"
				onSubmit={(e: React.FormEvent): void => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* biome-ignore-start lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				<form.AppField name="title">{(field): React.ReactNode => <field.TextInput label="Title" required />}</form.AppField>
				<form.AppField name="authorId">{(field): React.ReactNode => <field.TextInput label="Author" required />}</form.AppField>
				<form.AppField name="source">{(field): React.ReactNode => <field.TextInput label="Source" />}</form.AppField>
				<form.AppField name="servings">{(field): React.ReactNode => <field.TextInput label="Servings" />}</form.AppField>
				<form.AppField name="prepTime">
					{(field): React.ReactNode => <field.TextInput label="Prep Time (minutes)" />}
				</form.AppField>
				<form.AppField name="cookTime">
					{(field): React.ReactNode => <field.TextInput label="Cook Time (minutes)" />}
				</form.AppField>

				<form.Field name="sections" mode="array">
					{(sectionsField): React.ReactNode => (
						<div>
							{sectionsField.state.value?.map((section, i) => (
								<fieldset key={section.id || `new-${i}`}>
									<form.AppField name={`sections[${i}].title`}>
										{(titleField): React.ReactNode => (
											<>
												<legend>
													Section <b>{titleField.state.value || 'Untitled'}</b>
												</legend>
												<titleField.TextInput label="Section Title" />
											</>
										)}
									</form.AppField>

									<form.AppField name={`sections[${i}].order`}>
										{(field): React.ReactNode => <field.NumberInput label="Order" />}
									</form.AppField>

									<h4>Instructions</h4>
									<form.Field name={`sections[${i}].cookingMethods[0].instructions`} mode="array">
										{(instructionsField): React.ReactNode => (
											<div>
												<ol>
													{instructionsField.state.value?.map((instruction, instIdx) => (
														<li key={instruction.id || `new-inst-${instIdx}`}>
															<form.AppField name={`sections[${i}].cookingMethods[0].instructions[${instIdx}].stepNumber`}>
																{(field): React.ReactNode => <field.NumberInput label="Step Number" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].cookingMethods[0].instructions[${instIdx}].instruction`}>
																{(field): React.ReactNode => <field.TextareaInput label="Instruction" />}
															</form.AppField>

															<button type="button" onClick={(): void => instructionsField.removeValue(instIdx)}>
																Remove Step
															</button>
														</li>
													))}
												</ol>

												<button
													type="button"
													onClick={(): void =>
														instructionsField.pushValue({
															stepNumber: instructionsField.state.value ? instructionsField.state.value.length + 1 : 1,
															instruction: '',
														})
													}
												>
													Add Instruction
												</button>
											</div>
										)}
									</form.Field>

									<h4>Ingredients</h4>
									<form.Field name={`sections[${i}].ingredients`} mode="array">
										{(ingredientsField): React.ReactNode => (
											<div>
												<ul>
													{ingredientsField.state.value?.map((ingredient, ingIdx) => (
														<li key={ingredient.id || `new-ing-${ingIdx}`}>
															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].order`}>
																{(field): React.ReactNode => <field.NumberInput label="Order" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].quantity`}>
																{(field): React.ReactNode => <field.NumberInput label="Quantity" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].modifier`}>
																{(field): React.ReactNode => <field.TextInput label="Modifier" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].ingredientId`}>
																{(field): React.ReactNode => (
																	<field.SelectInput
																		label="Ingredient"
																		required
																		options={[
																			{ value: '', label: '--- select ingredient ---' },
																			...(allIngredients?.map(ing => ({
																				value: ing.id,
																				label: ing.name,
																			})) || []),
																		]}
																	/>
																)}
															</form.AppField>

															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].preparation`}>
																{(field): React.ReactNode => <field.TextInput label="Preparation" />}
															</form.AppField>

															<button type="button" onClick={(): void => ingredientsField.removeValue(ingIdx)}>
																Remove Ingredient
															</button>
														</li>
													))}
												</ul>

												<button
													type="button"
													onClick={(): void =>
														ingredientsField.pushValue({
															quantity: 1,
															order: ingredientsField.state.value ? ingredientsField.state.value.length : 0,
															ingredientId: '',
														})
													}
												>
													Add Ingredient
												</button>
											</div>
										)}
									</form.Field>

									<button type="button" onClick={(): void => sectionsField.removeValue(i)}>
										Remove Section
									</button>
								</fieldset>
							))}

							<button
								type="button"
								onClick={(): void =>
									sectionsField.pushValue({
										title: '',
										order: sectionsField.state.value ? sectionsField.state.value.length : 0,
										ingredients: [],
										cookingMethods: [{ name: 'Standard', order: 1, instructions: [] }],
									})
								}
							>
								Add Section
							</button>
						</div>
					)}
				</form.Field>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Recipe saved!</p>}
				<form.AppForm>
					<form.SubmitButton label={buttonText} />
				</form.AppForm>
			</Form.Root>
			<FormDevtools />{' '}
		</>
	);
}
