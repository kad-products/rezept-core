'use client';
import { useActionState } from 'react';

import FormField from '@/components/client/FormField';
import { saveListItem } from '@/functions/list-items';

export default function ListItem({ listId }: { listId: string }) {
	const [state, formAction] = useActionState(saveListItem, null);
	return (
		<form action={formAction}>
			<div>
				id:
				<input type="text" name="id" />
			</div>
			<div>
				listId:
				<input type="text" name="listId" value={listId} />
			</div>

			<FormField
				label="Ingredient ID"
				name="ingredientId"
				error={state?.errors?.ingredientId?.[0]}
				required
			/>

			<FormField
				label="Quantity"
				name="quantity"
				type="number"
				error={state?.errors?.quantity?.[0]}
			/>

			<FormField label="Unit ID" name="unitId" error={state?.errors?.unitId?.[0]} required />

			<FormField label="Status" name="status" type="select" error={state?.errors?.status?.[0]}>
				<option value="NEEDED">Needed</option>
				<option value="PURCHASED">Purchased</option>
				<option value="SKIPPED">Skipped</option>
			</FormField>

			<FormField label="Notes" name="notes" type="textarea" error={state?.errors?.notes?.[0]} />

			{state?.errors?._form && <p className="error">{state.errors._form[0]}</p>}

			{state?.success && <p className="success">Item saved!</p>}
			<button type="submit">Add</button>
		</form>
	);
}
