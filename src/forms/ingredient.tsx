'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveIngredient } from '@/actions/ingredients';
import { ingredientsSchemas } from '@/schemas';
import type { ActionState, IngredientDBRead, IngredientFormInput } from '@/types';
import { useAppForm } from './setup/context';

export default function IngredientForm({ ingredient }: { ingredient: IngredientDBRead }): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<IngredientDBRead>>();

	const form = useAppForm({
		formId: 'ingredient',
		defaultValues: {
			id: ingredient.id,
			name: ingredient.name,
			description: ingredient.description,
		} as IngredientFormInput,
		validators: {
			onBlur: ingredientsSchemas.form,
		},
		onSubmit: async ({ value }: { value: IngredientFormInput }): Promise<void> => {
			setFormState(await saveIngredient(value));
		},
	});

	return (
		<Form.Root
			className="rz-form"
			onSubmit={(e: React.FormEvent): void => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			{/* biome-ignore-start lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
			<form.AppField name="name">{(field): React.ReactNode => <field.TextInput label="Name" required />}</form.AppField>
			<form.AppField name="description">{(field): React.ReactNode => <field.TextareaInput label="Description" />}</form.AppField>
			{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
			{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
			{formState?.success && <p className="success">Ingredient saved.</p>}
			<form.AppForm>
				<form.SubmitButton label="Save Ingredient" />
			</form.AppForm>
		</Form.Root>
	);
}
