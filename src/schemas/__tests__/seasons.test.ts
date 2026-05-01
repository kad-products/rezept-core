// src/schemas/__tests__/season.test.ts
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { seasonsSchemas } from '../seasons';

describe('seasonsSchemas.form', () => {
	it('accepts valid season with all fields', () => {
		const validData = {
			name: 'Winter Season',
			description: 'Cold weather vegetables',
			country: 'US',
			region: 'Midwest',
			startMonth: 11,
			endMonth: 2,
			notes: 'Focus on root vegetables and hearty greens',
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid season with minimal required fields', () => {
		const validData = {
			name: 'Summer',
			country: 'FR',
			startMonth: 6,
			endMonth: 8,
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts all valid month values for startMonth', () => {
		for (let month = 1; month <= 12; month++) {
			const validData = {
				name: 'Test Season',
				country: 'US',
				startMonth: month,
				endMonth: 6,
			};

			const result = seasonsSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid month values for endMonth', () => {
		for (let month = 1; month <= 12; month++) {
			const validData = {
				name: 'Test Season',
				country: 'US',
				startMonth: 1,
				endMonth: month,
			};

			const result = seasonsSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		}
	});

	it('accepts season that wraps around the year', () => {
		const validData = {
			name: 'Winter Wrap',
			country: 'CA',
			startMonth: 11,
			endMonth: 2,
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid ISO country codes', () => {
		const validCountries = ['US', 'FR', 'DE', 'JP', 'GB', 'CA', 'AU', 'IT'];

		validCountries.forEach(country => {
			const validData = {
				name: 'Test Season',
				country,
				startMonth: 1,
				endMonth: 3,
			};

			const result = seasonsSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from name', () => {
		const validData = {
			name: '  Spring Season  ',
			country: 'US',
			startMonth: 3,
			endMonth: 5,
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Spring Season');
		}
	});

	it('trims whitespace from description', () => {
		const validData = {
			name: 'Test',
			description: '  Test description  ',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('Test description');
		}
	});

	it('trims whitespace from region', () => {
		const validData = {
			name: 'Test',
			country: 'US',
			region: '  Pacific Northwest  ',
			startMonth: 1,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.region).toBe('Pacific Northwest');
		}
	});

	it('trims whitespace from notes', () => {
		const validData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			notes: '  Test notes  ',
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBe('Test notes');
		}
	});

	it('converts empty string description to undefined', () => {
		const validData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			description: '',
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeUndefined();
		}
	});

	it('converts empty string region to undefined', () => {
		const validData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			region: '',
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.region).toBeUndefined();
		}
	});

	it('converts empty string notes to undefined', () => {
		const validData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			notes: '',
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBeUndefined();
		}
	});

	it('coerces string months to numbers', () => {
		const validData = {
			name: 'Test',
			country: 'US',
			startMonth: '3' as any,
			endMonth: '6' as any,
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.startMonth).toBe(3);
			expect(result.data.endMonth).toBe(6);
			expect(typeof result.data.startMonth).toBe('number');
			expect(typeof result.data.endMonth).toBe('number');
		}
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			description: 'Test',
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
			expect(paths).toContain('country');
			expect(paths).toContain('startMonth');
			expect(paths).toContain('endMonth');
		}
	});

	it('rejects empty name after trim', () => {
		const invalidData = {
			name: '   ',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('rejects invalid country code format (not 2 letters)', () => {
		const invalidData = {
			name: 'Test',
			country: 'USA',
			startMonth: 1,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('country');
		}
	});

	it('rejects invalid country code (not in ISO list)', () => {
		const invalidData = {
			name: 'Test',
			country: 'ZZ',
			startMonth: 1,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('country');
		}
	});

	it('rejects startMonth less than 1', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 0,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('startMonth');
		}
	});

	it('rejects startMonth greater than 12', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 13,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('startMonth');
		}
	});

	it('rejects endMonth less than 1', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 0,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('endMonth');
		}
	});

	it('rejects endMonth greater than 12', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 15,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('endMonth');
		}
	});

	it('rejects decimal month values', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1.5,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('startMonth');
		}
	});

	it('rejects description longer than 500 characters', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			description: 'a'.repeat(501),
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('description');
		}
	});

	it('accepts description exactly 500 characters', () => {
		const validData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			description: 'a'.repeat(500),
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects notes longer than 2000 characters', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			notes: 'a'.repeat(2001),
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('notes');
		}
	});

	it('accepts notes exactly 2000 characters', () => {
		const validData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			notes: 'a'.repeat(2000),
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid season with ingredients', () => {
		const validData = {
			name: 'Summer',
			country: 'US',
			startMonth: 6,
			endMonth: 8,
			ingredients: [randomUUID(), randomUUID(), randomUUID()],
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts empty ingredients array', () => {
		const validData = {
			name: 'Fall',
			country: 'US',
			startMonth: 9,
			endMonth: 11,
			ingredients: [],
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('defaults to empty array when ingredients not provided', () => {
		const validData = {
			name: 'Spring',
			country: 'US',
			startMonth: 3,
			endMonth: 5,
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.ingredients).toEqual([]);
		}
	});

	it('rejects ingredients with invalid UUID', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			ingredients: [randomUUID(), 'not-a-uuid', randomUUID()],
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const ingredientErrors = result.error.issues.filter(issue => issue.path[0] === 'ingredients');
			expect(ingredientErrors.length).toBeGreaterThan(0);
		}
	});

	it('rejects non-array ingredients', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			ingredients: 'not-an-array' as any,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('ingredients');
		}
	});

	it('accepts season without id (create)', () => {
		const validData = {
			name: 'Spring',
			country: 'US',
			startMonth: 3,
			endMonth: 5,
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBeUndefined();
		}
	});

	it('accepts season with valid id (update)', () => {
		const validData = {
			id: randomUUID(),
			name: 'Updated Winter',
			description: 'Updated description',
			country: 'CA',
			region: 'Quebec',
			startMonth: 12,
			endMonth: 2,
			notes: 'Updated notes',
		};

		const result = seasonsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID format for id when present', () => {
		const invalidData = {
			id: 'bad-uuid',
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
		};

		const result = seasonsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});
});
