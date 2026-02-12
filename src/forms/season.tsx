'use client';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { useState } from 'react';
import { z } from 'zod';
import { useAppForm } from '@/components/form-fields/context';
import { saveSeason } from '@/functions/seasons';
import type { Ingredient } from '@/models/ingredients';
import type { SeasonalIngredientWithRelations } from '@/repositories/seasonal-ingredients';

const userLocale = navigator.language; // 'en-US', 'nb-NO', etc.
const monthNames = Array.from({ length: 12 }, (_, i) => {
	const date = new Date(2000, i, 1);
	return {
		name: new Intl.DateTimeFormat(userLocale, { month: 'long' }).format(date),
		code: i + 1,
	};
});

type ActionState = {
	success: boolean | undefined;
	errors?: Record<string, string[]>;
} | null;

type SeasonFormData = {
	name: string;
	id?: string | undefined;
	description?: string | undefined | null;
	country: string;
	region?: string | null;
	startMonth: number;
	endMonth: number;
	notes?: string | null;
	ingredients: string[];
};

const schema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	country: z.string(),
	region: z.string().optional(),
	startMonth: z.number(),
	endMonth: z.number(),
	notes: z.string().optional(),
	ingredients: z.array(z.string()),
});

export default function Season({
	season,
	ingredients,
	seasonalIngredients,
	countries,
}: {
	season?: Omit<SeasonFormData, 'ingredients'>;
	ingredients: Ingredient[];
	seasonalIngredients?: SeasonalIngredientWithRelations[];
	countries: { code: string; name: string }[];
}) {
	const [formError, setFormError] = useState<string | null>(null);
	const [serverActionResult, setServerActionResult] = useState<ActionState>({
		success: undefined,
	});

	const form = useAppForm({
		defaultValues: season
			? {
					...season,
					ingredients: seasonalIngredients?.map(si => si.ingredientId) || [],
				}
			: ({} as SeasonFormData),
		validators: {
			onSubmit: schema,
		},
		onSubmit: async ({ value }) => {
			setFormError(null); // Clear previous errors
			const result = await saveSeason(value);

			if (!result?.success) {
				setFormError(result?.errors?._form?.[0] || 'Something went wrong');
			}

			setServerActionResult(result);
		},
	});

	const buttonText = season ? 'Save Season' : 'Add Season';

	const ingredientOptions = ingredients.map(i => ({
		value: i.id,
		label: i.name,
	}));

	const countryOptions = countries.map(c => ({
		value: c.code,
		label: c.name,
	}));

	const monthOptions = monthNames.map(m => ({
		value: m.code,
		label: m.name,
	}));

	return (
		<>
			<form
				onSubmit={e => {
					console.log(`Trying to submit the form`);
					e.preventDefault();
					e.stopPropagation();
					console.log(`About to hit the go button`);
					form.handleSubmit();
				}}
			>
				{JSON.stringify(form.getAllErrors())}
				{JSON.stringify(formError)}
				<form.AppField name="name">{field => <field.TextInput label="Name" required />}</form.AppField>

				<form.AppField name="description">{field => <field.TextareaInput label="Description" required />}</form.AppField>

				<form.AppField name="country">
					{field => <field.Select label="Country" options={countryOptions} required />}
				</form.AppField>

				<form.AppField name="region">{field => <field.TextInput label="Region" required />}</form.AppField>

				<form.AppField name="startMonth">
					{field => <field.Select<number> label="Start Month" options={monthOptions} required />}
				</form.AppField>

				<form.AppField name="endMonth">
					{field => <field.Select<number> label="End Month" options={monthOptions} required />}
				</form.AppField>

				<form.AppField name="notes">{field => <field.TextareaInput label="Notes" />}</form.AppField>

				<form.AppField name="ingredients">
					{field => <field.CheckboxGroup label="Ingredients" required options={ingredientOptions} />}
				</form.AppField>

				{serverActionResult?.errors && <p className="error">{JSON.stringify(serverActionResult?.errors, null, 4)}</p>}

				{serverActionResult?.success && <p className="success">Season saved!</p>}

				<button type="submit">{buttonText}</button>
			</form>
			<TanStackDevtools plugins={[formDevtoolsPlugin()]} />
		</>
	);
}
