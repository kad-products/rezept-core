'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveSeason } from '@/actions/seasons';
import { seasonsSchemas } from '@/schemas';
import type { ActionState, SeasonalIngredientWithRelations, SeasonDBRead, SeasonFormInput } from '@/types';
import { useAppForm } from './context';
import { FormDevtools } from './FormDevtools';

export default function SeasonForm({
	season,
	ingredientOptions,
	seasonalIngredients,
	countryOptions,
	monthOptions,
}: {
	season?: SeasonDBRead;
	ingredientOptions: { value: string; label: string }[];
	seasonalIngredients?: SeasonalIngredientWithRelations[];
	countryOptions: { value: string; label: string }[];
	monthOptions: { value: number; label: string }[];
}): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<SeasonDBRead>>();

	const schema = seasonsSchemas.form;

	const form = useAppForm({
		formId: 'season',
		defaultValues: season
			? {
					...season,
					ingredients: seasonalIngredients?.map(si => si.ingredientId) || [],
				}
			: ({} as SeasonFormInput),
		validators: {
			onBlur: schema,
		},
		onSubmit: async ({ value: formDataObj }: { value: SeasonFormInput }): Promise<void> => {
			setFormState(await saveSeason(formDataObj));
		},
	});

	const buttonText = season ? 'Save Season' : 'Add Season';

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
				<form.AppField name="name">{(field): React.ReactNode => <field.TextInput label="Name" required />}</form.AppField>
				<form.AppField name="description">
					{(field): React.ReactNode => <field.TextareaInput label="Description" required />}
				</form.AppField>
				<form.AppField name="country">
					{(field): React.ReactNode => <field.Select label="Country" options={countryOptions} required />}
				</form.AppField>
				<form.AppField name="region">{(field): React.ReactNode => <field.TextInput label="Region" required />}</form.AppField>
				<form.AppField name="startMonth">
					{(field): React.ReactNode => <field.Select<number> label="Start Month" options={monthOptions} required />}
				</form.AppField>
				<form.AppField name="endMonth">
					{(field): React.ReactNode => <field.Select<number> label="End Month" options={monthOptions} required />}
				</form.AppField>
				<form.AppField name="notes">{(field): React.ReactNode => <field.TextareaInput label="Notes" />}</form.AppField>
				<form.AppField name="ingredients">
					{(field): React.ReactNode => <field.CheckboxGroup label="Ingredients" required options={ingredientOptions} />}
				</form.AppField>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Season saved!</p>}
				<form.AppForm>
					<form.Submit label={buttonText} />
				</form.AppForm>
			</Form.Root>
			<FormDevtools />
		</>
	);
}
