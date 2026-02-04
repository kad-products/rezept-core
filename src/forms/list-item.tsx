'use client';
import { useActionState } from 'react';

import FormField from '@/components/client/FormField';
import { saveListItem } from '@/functions/list-items';
import type { IngredientUnit } from '@/models/ingredient-units';
import type { Ingredient } from '@/models/ingredients';
import type { ListItem as ListItemModel } from '@/models/list-items';

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
			{item?.id && (
				<div>
					id:
					<input type="text" name="id" value={item.id} />
				</div>
			)}

			<div>
				listId:
				<input type="text" name="listId" value={listId} />
			</div>

			<FormField label="Ingredient ID" name="ingredientId" type="select" errors={state?.errors?.ingredientId} required>
				{ingredients.map(ingredient => (
					<option key={ingredient.id} value={ingredient.id}>
						{ingredient.name}
					</option>
				))}
			</FormField>

			<FormField label="Quantity" name="quantity" type="number" errors={state?.errors?.quantity} />

			<FormField label="Unit ID" name="unitId" type="select" errors={state?.errors?.unitId}>
				{units.map(unit => (
					<option key={unit.id} value={unit.id}>
						{unit.name}
					</option>
				))}
			</FormField>

			<FormField label="Status" name="status" type="select" errors={state?.errors?.status}>
				<option value="NEEDED">Needed</option>
				<option value="PURCHASED">Purchased</option>
				<option value="SKIPPED">Skipped</option>
			</FormField>

			<FormField label="Notes" name="notes" type="textarea" errors={state?.errors?.notes} />

			{state?.errors?._form && <p className="error">{state.errors._form[0]}</p>}

			{state?.success && <p className="success">Item saved!</p>}
			<button type="submit">Add</button>
		</form>
	);
}
