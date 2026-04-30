'use client';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveRecipe } from '@/actions';
import { recipesSchemas } from '@/schemas';
import type { ActionState, Ingredient, RecipeFormData, RecipeWithSections } from '@/types';
import { useAppForm } from './context';

export default function Recipe({
	recipe,
	allIngredients,
	currentUserId,
}: {
	recipe?: RecipeWithSections;
	allIngredients?: Ingredient[];
	currentUserId: string | undefined;
}): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<RecipeFormData>>();

	const newRecipeDefaults = {
		title: '',
		sections: [],
		authorId: currentUserId,
	};

	const form = useAppForm({
		formId: 'recipe',
		defaultValues: (recipe ? recipe : newRecipeDefaults) as RecipeFormData,
		validators: {
			onBlur({ value }: { value: RecipeFormData }): string | undefined {
				// having to do this manually because typescript didn't like the signature of recipeFormSchema
				// and the type it expected/returned compared to the shape of the form data
				console.log(`Form values: ${JSON.stringify(value, null, 4)}`);
				const results = recipesSchemas.form.safeParse(value);
				console.log(`Schema results: ${JSON.stringify(results, null, 4)}`);
				if (results.success) {
					return undefined;
				}
			},
		},
		onSubmit: async ({ value: formDataObj }: { value: RecipeFormData }): Promise<void> => {
			setFormState(await saveRecipe(formDataObj));
		},
	});

	const buttonText = recipe ? 'Save Recipe' : 'Add Recipe';

	return (
		<>
			<Form.Root
				className="rz-form"
				onSubmit={(e: React.FormEvent): void => {
					console.log(`Trying to submit the form`);
					e.preventDefault();
					e.stopPropagation();
					console.log(`About to hit the go button`);

					console.log('=== PRE-SUBMISSION STATE ===');
					console.log('canSubmit:', form.state.canSubmit);
					console.log('isValid:', form.state.isValid);
					console.log('Errors:', form.state.errors);
					console.log('Values:', form.state.values);
					console.log('Submission attempts:', form.state.submissionAttempts);
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
									<form.Field name={`sections[${i}].instructions`} mode="array">
										{(instructionsField): React.ReactNode => (
											<div>
												<ol>
													{instructionsField.state.value?.map((instruction, instIdx) => (
														<li key={instruction.id || `new-inst-${instIdx}`}>
															<form.AppField name={`sections[${i}].instructions[${instIdx}].stepNumber`}>
																{(field): React.ReactNode => <field.NumberInput label="Step Number" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].instructions[${instIdx}].instruction`}>
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
																	<field.Select
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
										instructions: [],
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
				{formState?.success && <p className="success">Season saved!</p>}
				<form.AppForm>
					<form.Submit label={buttonText} />
				</form.AppForm>
				<form.Subscribe
					key={form.state.submissionAttempts} // Force re-render on each attempt
					selector={(state: { errors: unknown[]; submissionAttempts: number }): { errors: unknown[]; attempts: number } => ({
						errors: state.errors,
						attempts: state.submissionAttempts,
					})}
				>
					{(state: { errors: unknown[]; attempts: number }): React.ReactNode => (
						<div>
							<pre>Submission Attempts: {state.attempts}</pre>
							<pre>Errors: {JSON.stringify(state.errors, null, 2)}</pre>
						</div>
					)}
				</form.Subscribe>
			</Form.Root>
			{import.meta.env.DEV && <TanStackDevtools plugins={[formDevtoolsPlugin()]} />}{' '}
		</>
	);
}
