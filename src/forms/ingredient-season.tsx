'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveIngredientSeason } from '@/actions/ingredient-seasons';
import { ingredientSeasonsSchemas } from '@/schemas';
import type { ActionState, IngredientSeasonFormInput, IngredientSeasonsDBRead } from '@/types';
import { useAppForm } from './setup/context';
import { FormDevtools } from './setup/FormDevtools';

export default function IngredientSeasonForm({
	ingredientSeason,
	ingredientId,
	countryOptions,
	monthOptions,
}: {
	ingredientSeason?: IngredientSeasonFormInput;
	ingredientId: string;
	countryOptions: { value: string; label: string }[];
	monthOptions: { value: string; label: string }[];
}): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<IngredientSeasonsDBRead>>();

	const defaultSeason: IngredientSeasonFormInput = {
		startMonth: '1',
		endMonth: '12',
		country: 'USA',
		ingredientId,
	};

	const form = useAppForm({
		formId: 'ingredient-season',
		defaultValues: ingredientSeason ?? defaultSeason,
		validators: {
			onBlur: ingredientSeasonsSchemas.form,
		},
		onSubmit: async ({ value }: { value: IngredientSeasonFormInput }): Promise<void> => {
			setFormState(await saveIngredientSeason(value));
		},
	});

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
				<form.AppField name="country">
					{(field): React.ReactNode => <field.SelectInput label="Country" options={countryOptions} required />}
				</form.AppField>
				<form.AppField name="region">{(field): React.ReactNode => <field.TextInput label="Region" required />}</form.AppField>
				<form.AppField name="startMonth">
					{(field): React.ReactNode => <field.SelectInput label="Start Month" options={monthOptions} required />}
				</form.AppField>
				<form.AppField name="endMonth">
					{(field): React.ReactNode => <field.SelectInput label="End Month" options={monthOptions} required />}
				</form.AppField>
				<form.AppField name="notes">{(field): React.ReactNode => <field.TextareaInput label="Notes" />}</form.AppField>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Ingredient saved.</p>}
				<form.AppForm>
					<form.SubmitButton label="Save Ingredient" />
				</form.AppForm>
			</Form.Root>
			<FormDevtools />
		</>
	);
}
