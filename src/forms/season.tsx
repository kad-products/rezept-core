'use client';
import { useActionState } from 'react';
import { saveSeason } from '@/actions/seasons';
import Checkboxes from '@/components/client/Checkboxes';
import FormField from '@/components/client/FormField';
import FormFieldWrapper from '@/components/client/FormFieldWrapper';
import type { SeasonalIngredientWithRelations } from '@/repositories/seasonal-ingredients';
import type { Ingredient, Season as SeasonModel } from '@/types';

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
			<FormField label="Name" name="name" type="text" errors={state?.errors?.name} value={season?.name} />

			<FormField
				label="Country"
				name="country"
				type="select"
				options={countries.map(c => ({ value: c.code, label: c.name }))}
				errors={state?.errors?.country}
				required
				value={season?.country}
			/>

			<FormField label="Region" name="region" type="text" errors={state?.errors?.region} value={season?.region} />

			<FormField
				label="Start Month"
				name="startMonth"
				type="select"
				required
				options={monthNames.map(m => ({ value: m.code, label: m.name }))}
				errors={state?.errors?.startMonth}
				value={season?.startMonth}
			/>

			<FormField
				label="End Month"
				name="endMonth"
				type="select"
				required
				options={monthNames.map(m => ({ value: m.code, label: m.name }))}
				errors={state?.errors?.endMonth}
				value={season?.endMonth}
			/>

			<FormField
				label="Description"
				name="description"
				type="textarea"
				errors={state?.errors?.description}
				value={season?.description}
			/>

			<FormField label="Notes" name="notes" type="textarea" errors={state?.errors?.notes} value={season?.notes} />

			<FormFieldWrapper errors={state?.errors?.ingredients}>
				<Checkboxes
					label="Ingredients"
					name="ingredients"
					options={ingredients.map(ingredient => ({
						value: ingredient.id,
						label: ingredient.name,
						checked: seasonalIngredients ? seasonalIngredients.some(si => si.ingredientId === ingredient.id) : false,
					}))}
				/>
			</FormFieldWrapper>

			{state?.errors?._form && <p className="error">{state.errors._form[0]}</p>}

			{state?.success && <p className="success">Season saved!</p>}

			{season?.id && <input type="hidden" name="id" value={season.id} />}

			<button type="submit">{buttonText}</button>
		</form>
	);
}
