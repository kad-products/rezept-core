import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { inSeasonRecipeSearchSchemas } from '../in-season-recipe-search';

describe('inSeasonRecipeSearchSchemas.form', () => {
	describe('valid inputs', () => {
		it('accepts a valid growingZoneId UUID', () => {
			const result = inSeasonRecipeSearchSchemas.form.safeParse({ growingZoneId: randomUUID() });
			expect(result.success).toBe(true);
		});

		it('accepts without recipeSearchTerm', () => {
			const result = inSeasonRecipeSearchSchemas.form.safeParse({ growingZoneId: randomUUID() });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.recipeSearchTerm).toBeUndefined();
			}
		});

		it('accepts with a recipeSearchTerm string', () => {
			const result = inSeasonRecipeSearchSchemas.form.safeParse({ growingZoneId: randomUUID(), recipeSearchTerm: 'tomato' });
			expect(result.success).toBe(true);
		});

		it('accepts empty string for recipeSearchTerm', () => {
			const result = inSeasonRecipeSearchSchemas.form.safeParse({ growingZoneId: randomUUID(), recipeSearchTerm: '' });
			expect(result.success).toBe(true);
		});
	});

	describe('growingZoneId validation', () => {
		it('rejects a non-UUID string', () => {
			const result = inSeasonRecipeSearchSchemas.form.safeParse({ growingZoneId: 'not-a-uuid' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('growingZoneId');
			}
		});

		it('rejects an empty string', () => {
			const result = inSeasonRecipeSearchSchemas.form.safeParse({ growingZoneId: '' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('growingZoneId');
			}
		});

		it('rejects a missing growingZoneId', () => {
			const result = inSeasonRecipeSearchSchemas.form.safeParse({});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('growingZoneId');
			}
		});
	});
});
