import { describe, expect, it } from 'vitest';
import { createListItemFormValidationSchema } from '../';

describe('ListItem form schema', () => {
	it('accepts valid list item data', () => {
		const validData = {
			listId: '123',
			ingredientId: 'ingredient-123',
			quantity: 5,
			status: 'NEEDED' as const,
		};

		const result = createListItemFormValidationSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects missing required ingredientId', () => {
		const invalidData = {
			quantity: 5,
			status: 'NEEDED' as const,
		};

		const result = createListItemFormValidationSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});
});
