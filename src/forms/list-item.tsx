'use client';
import { useActionState } from 'react';
import { saveListItem } from '@/actions/list-items';
import FormField from '@/components/client/FormField';
import type { Ingredient, IngredientUnit, ListItem as ListItemModel } from '@/types';

export default function ListItem({
	item,
	listId,
	units,
	ingredients,
}: {
	item: ListItemModel | null;
	listId: string;
	units: IngredientUnit[];
	ingredients: Ingredient[];
}) {
	const [state, formAction] = useActionState(saveListItem, null);
	return (
		<form action={formAction}>
			<FormField
				label="Ingredient ID"
				name="ingredientId"
				type="select"
				creatable={true}
				options={ingredients.map(i => ({ value: i.id, label: i.name }))}
				errors={state?.errors?.ingredientId}
				required
			/>

			<FormField label="Quantity" name="quantity" type="number" errors={state?.errors?.quantity} />

			<FormField
				label="Unit ID"
				name="unitId"
				type="select"
				options={units.map(u => ({ value: u.id, label: u.name }))}
				errors={state?.errors?.unitId}
			/>

			<FormField
				label="Status"
				name="status"
				type="select"
				options={[
					{ value: 'NEEDED', label: 'Needed' },
					{ value: 'PURCHASED', label: 'Purchased' },
					{ value: 'SKIPPED', label: 'Skipped' },
				]}
				errors={state?.errors?.status}
			/>

			<FormField label="Notes" name="notes" type="textarea" errors={state?.errors?.notes} />

			{state?.errors?._form && <p className="error">{state.errors._form[0]}</p>}

			{state?.success && <p className="success">Item saved!</p>}

			{item?.id && <input type="hidden" name="id" value={item.id} />}
			<input type="hidden" name="listId" value={listId} />

			<button type="submit">Add</button>
		</form>
	);
}
