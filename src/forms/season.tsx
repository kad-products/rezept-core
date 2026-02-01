'use client';
import { useActionState } from 'react';

import FormField from '@/components/client/FormField';
import { saveSeason } from '@/functions/season';
import type { Ingredient } from '@/models/ingredients';
import type { Season as SeasonModel } from '@/models/seasons';

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
	countries,
}: {
	season?: SeasonModel;
	ingredients: Ingredient[];
	countries: { code: string; name: string }[];
}) {
	const [state, formAction] = useActionState(saveSeason, null);
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
				error={state?.errors?.name?.[0]}
				value={season?.name}
			/>

			<FormField
				label="Country"
				name="country"
				type="select"
				error={state?.errors?.country?.[0]}
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
				error={state?.errors?.region?.[0]}
				value={season?.region}
			/>

			<FormField
				label="Start Month"
				name="startMonth"
				type="select"
				error={state?.errors?.startMonth?.[0]}
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
				error={state?.errors?.endMonth?.[0]}
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
				error={state?.errors?.description?.[0]}
				value={season?.description}
			/>

			<FormField
				label="Notes"
				name="notes"
				type="textarea"
				error={state?.errors?.notes?.[0]}
				value={season?.notes}
			/>

			{state?.errors?._form && <p className="error">{state.errors._form[0]}</p>}

			{state?.success && <p className="success">Season saved!</p>}
			<button type="submit">Add</button>
		</form>
	);
}
