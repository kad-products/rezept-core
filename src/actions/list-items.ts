'use server';

import { env } from 'cloudflare:workers';
import { requestInfo } from 'rwsdk/worker';
import { createListItem, removeListItemById, updateListItem } from '@/repositories/list-items';
import { createListItemFormValidationSchema } from '@/schemas';
import type { ActionState } from '@/types';

export async function removeListItem(itemId: string) {
	return await removeListItemById(itemId);
}

export async function saveListItem(_prevState: ActionState, formData: FormData): Promise<ActionState> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	const parsed = createListItemFormValidationSchema.safeParse(Object.fromEntries(formData));

	console.log(`Form data received: ${JSON.stringify(parsed, null, 4)} `);

	if (!parsed.success) {
		console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	try {
		if (!parsed.data.id) {
			await createListItem(parsed.data, userId);
		} else {
			await updateListItem(parsed.data.id, parsed.data, userId);
		}

		return { success: true };
	} catch (error) {
		console.log(`Error saving list item: ${error} `);

		console.log(error);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}
}
