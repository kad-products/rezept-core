'use client';
import { useActionState } from 'react';
import Checkboxes from '@/components/client/Checkboxes';
import FormField from '@/components/client/FormField';
import FormFieldWrapper from '@/components/client/FormFieldWrapper';
import { saveSeason } from '@/functions/seasons';
import type { Ingredient } from '@/models/ingredients';
import type { Season as SeasonModel } from '@/models/seasons';
import type { SeasonalIngredientWithRelations } from '@/repositories/seasonal-ingredients';

const userLocale = navigator.language; // 'en-US', 'nb-NO', etc.
const monthNames = Array.from({ length: 12 }, (_, i) => {
	const date = new Date(2000, i, 1);
	return {
		name: new Intl.DateTimeFormat(userLocale, { month: 'long' }).format(date),
		code: i + 1,
	};
});

export default function Season({
	season,
	ingredients,
	seasonalIngredients,
	countries,
}: {
	season?: SeasonModel;
	ingredients: Ingredient[];
	seasonalIngredients?: SeasonalIngredientWithRelations[];
	countries: { code: string; name: string }[];
}) {
	const [state, formAction] = useActionState(saveSeason, null);

	const buttonText = season ? 'Save Season' : 'Add Season';

	return (
		<form action={formAction}>
			{season?.id && (
				<div>
					id:
					<input type="text" name="id" value={season.id} />
				</div>
			)}

			{JSON.stringify(season, null, 2)}

			<FormField
				label="Name"
				name="name"
				type="text"
				errors={state?.errors?.name?.[0]}
				value={season?.name}
			/>

			<FormField
				label="Country"
				name="country"
				type="select"
				errors={state?.errors?.country?.[0]}
				required
				value={season?.country}
			>
				{countries.map(country => (
					<option key={country.code} value={country.code}>
						{country.name}
					</option>
				))}
			</FormField>

			<FormField
				label="Region"
				name="region"
				type="text"
				errors={state?.errors?.region?.[0]}
				value={season?.region}
			/>

			<FormField
				label="Start Month"
				name="startMonth"
				type="select"
				errors={state?.errors?.startMonth?.[0]}
				value={season?.startMonth}
			>
				{monthNames.map(month => (
					<option key={month.code} value={month.code}>
						{month.name}
					</option>
				))}
			</FormField>

			<FormField
				label="End Month"
				name="endMonth"
				type="select"
				errors={state?.errors?.endMonth?.[0]}
				value={season?.endMonth}
			>
				{monthNames.map(month => (
					<option key={month.code} value={month.code}>
						{month.name}
					</option>
				))}
			</FormField>

			<FormField
				label="Description"
				name="description"
				type="textarea"
				errors={state?.errors?.description?.[0]}
				value={season?.description}
			/>

			<FormField
				label="Notes"
				name="notes"
				type="textarea"
				errors={state?.errors?.notes?.[0]}
				value={season?.notes}
			/>

			<FormFieldWrapper errors={state?.errors?.ingredients?.[0]}>
				<Checkboxes
					label="Ingredients"
					name="ingredients"
					options={ingredients.map(ingredient => ({
						value: ingredient.id,
						label: ingredient.name,
						checked: seasonalIngredients
							? seasonalIngredients.some(si => si.ingredientId === ingredient.id)
							: false,
					}))}
				/>
			</FormFieldWrapper>

			{state?.errors?._form && <p className="error">{state.errors._form[0]}</p>}

			{state?.success && <p className="success">Season saved!</p>}
			<button type="submit">{buttonText}</button>
		</form>
	);
}
