"use client";
import { useActionState } from 'react';
import { saveListItem } from "@/functions/list-items";

export default function ListItem({ listId }: { listId: string }) {
    const [state, formAction] = useActionState(saveListItem, null);
    return (
        <form action={formAction}>
            <div>id:<input type="text" name="id" /></div>
            <div>listId:<input type="text" name="listId" value={listId} /></div>

            <div>
                <label>Ingredient ID:</label>
                <input type="text" name="ingredientId" />
                {state?.errors?.ingredientId && (
                    <p className="error">{state.errors.ingredientId[0]}</p>
                )}
            </div>

            <div>
                <label>Quantity:</label>
                <input type="number" name="quantity" />
                {state?.errors?.quantity && (
                    <p className="error">{state.errors.quantity[0]}</p>
                )}
            </div>

            <div>
                <label>Unit ID:</label>
                <input type="text" name="unitId" />
                {state?.errors?.unitId && (
                    <p className="error">{state.errors.unitId[0]}</p>
                )}
            </div>

            <div>
                <label>Status:</label>
                <select name="status">
                    <option value="NEEDED">Needed</option>
                    <option value="PURCHASED">Purchased</option>
                    <option value="SKIPPED">Skipped</option>
                </select>
                {state?.errors?.status && (
                    <p className="error">{state.errors.status[0]}</p>
                )}
            </div>

            <div>
                <label>Notes:</label>
                <textarea name="notes" />
                {state?.errors?.notes && (
                    <p className="error">{state.errors.notes[0]}</p>
                )}
            </div>

            {state?.errors?._form && (
                <p className="error">{state.errors._form[0]}</p>
            )}

            {state?.success && <p className="success">Item saved!</p>}
            <button type="submit">Add</button>
        </form>
    );
}