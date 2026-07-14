import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { growingZonesSchemas } from '../growing-zones';

describe('growingZonesSchemas.form', () => {
	describe('valid inputs', () => {
		it('accepts valid code and name', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'us_pacific_coast', name: 'US Pacific Coast' });
			expect(result.success).toBe(true);
		});

		it('accepts code with only letters', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'mediterranean', name: 'Mediterranean' });
			expect(result.success).toBe(true);
		});

		it('accepts code with only underscores and letters', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'central_europe', name: 'Central Europe' });
			expect(result.success).toBe(true);
		});

		it('accepts code with a leading underscore', () => {
			const result = growingZonesSchemas.form.safeParse({ code: '_tropical', name: 'Tropical' });
			expect(result.success).toBe(true);
		});

		it('accepts a single-character code', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'a', name: 'Zone A' });
			expect(result.success).toBe(true);
		});

		it('accepts without id (create)', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'us_midwest', name: 'US Midwest' });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBeUndefined();
			}
		});

		it('accepts with valid UUID id (update)', () => {
			const result = growingZonesSchemas.form.safeParse({ id: randomUUID(), code: 'us_midwest', name: 'US Midwest' });
			expect(result.success).toBe(true);
		});

		it('trims whitespace from name', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'mediterranean', name: '  Mediterranean  ' });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe('Mediterranean');
			}
		});

		it('trims whitespace from code before applying regex', () => {
			const result = growingZonesSchemas.form.safeParse({ code: '  us_west  ', name: 'US West' });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.code).toBe('us_west');
			}
		});
	});

	describe('code validation', () => {
		it('rejects uppercase letters', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'US_West', name: 'US West' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('code');
			}
		});

		it('rejects digits', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'zone1', name: 'Zone 1' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('code');
			}
		});

		it('rejects hyphens', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'us-west', name: 'US West' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('code');
			}
		});

		it('rejects spaces', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'us west', name: 'US West' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('code');
			}
		});

		it('rejects empty string', () => {
			const result = growingZonesSchemas.form.safeParse({ code: '', name: 'US West' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('code');
			}
		});

		it('rejects whitespace-only string', () => {
			const result = growingZonesSchemas.form.safeParse({ code: '   ', name: 'US West' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('code');
			}
		});

		it('rejects missing code', () => {
			const result = growingZonesSchemas.form.safeParse({ name: 'US West' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('code');
			}
		});
	});

	describe('name validation', () => {
		it('rejects empty name', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'us_west', name: '' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('name');
			}
		});

		it('rejects whitespace-only name', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'us_west', name: '   ' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('name');
			}
		});

		it('rejects missing name', () => {
			const result = growingZonesSchemas.form.safeParse({ code: 'us_west' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('name');
			}
		});
	});

	describe('id validation', () => {
		it('rejects invalid UUID for id', () => {
			const result = growingZonesSchemas.form.safeParse({ id: 'not-a-uuid', code: 'us_west', name: 'US West' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('id');
			}
		});
	});
});
