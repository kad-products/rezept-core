import { describe, expect, it } from 'vitest';
import { permissionsOverrideSchemas } from '@/schemas';

describe('permissionsOverrideSchemas.form', () => {
	describe('valid input', () => {
		it('accepts a single valid permission', () => {
			const result = permissionsOverrideSchemas.form.safeParse({ permissions: ['recipes:read'] });
			expect(result.success).toBe(true);
		});

		it('accepts multiple valid permissions', () => {
			const result = permissionsOverrideSchemas.form.safeParse({
				permissions: ['recipes:read', 'recipes:create', 'ingredients:read'],
			});
			expect(result.success).toBe(true);
		});

		it('accepts all known permissions', () => {
			const result = permissionsOverrideSchemas.form.safeParse({
				permissions: ['recipes:read', 'api-keys:create', 'seasons:delete', 'permissions:override'],
			});
			expect(result.success).toBe(true);
		});
	});

	describe('invalid input', () => {
		it('rejects an empty permissions array', () => {
			const result = permissionsOverrideSchemas.form.safeParse({ permissions: [] });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.flatten().fieldErrors.permissions).toBeDefined();
			}
		});

		it('rejects a permission string not in the known set', () => {
			const result = permissionsOverrideSchemas.form.safeParse({ permissions: ['apiKeys:create'] });
			expect(result.success).toBe(false);
		});

		it('rejects a completely unknown permission', () => {
			const result = permissionsOverrideSchemas.form.safeParse({ permissions: ['not-a-permission'] });
			expect(result.success).toBe(false);
		});

		it('rejects a missing permissions field', () => {
			const result = permissionsOverrideSchemas.form.safeParse({});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.flatten().fieldErrors.permissions).toBeDefined();
			}
		});

		it('rejects a non-array permissions value', () => {
			const result = permissionsOverrideSchemas.form.safeParse({ permissions: 'recipes:read' });
			expect(result.success).toBe(false);
		});
	});
});
