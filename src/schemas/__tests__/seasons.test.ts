// src/schemas/__tests__/season.test.ts
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createSeasonSchema, updateSeasonSchema } from '../seasons';

describe('CreateSeason form schema', () => {
	it('accepts valid season with all fields', () => {
		const validData = {
			name: 'Winter Season',
			description: 'Cold weather vegetables',
			country: 'US',
			region: 'Midwest',
			startMonth: 11,
			endMonth: 2,
			notes: 'Focus on root vegetables and hearty greens',
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid season with minimal required fields', () => {
		const validData = {
			name: 'Summer',
			country: 'FR',
			startMonth: 6,
			endMonth: 8,
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts all valid month values for startMonth', () => {
		for (let month = 1; month <= 12; month++) {
			const validData = {
				name: 'Test Season',
				country: 'US',
				startMonth: month,
				endMonth: 6,
				createdBy: randomUUID(),
			};

			const result = createSeasonSchema.safeParse(validData);
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
				createdBy: randomUUID(),
			};

			const result = createSeasonSchema.safeParse(validData);
			expect(result.success).toBe(true);
		}
	});

	it('accepts season that wraps around the year', () => {
		const validData = {
			name: 'Winter Wrap',
			country: 'CA',
			startMonth: 11,
			endMonth: 2,
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
				createdBy: randomUUID(),
			};

			const result = createSeasonSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from name', () => {
		const validData = {
			name: '  Spring Season  ',
			country: 'US',
			startMonth: 3,
			endMonth: 5,
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects notes longer than 2000 characters', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			notes: 'a'.repeat(2001),
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid season with ingredients', () => {
		const validData = {
			name: 'Summer',
			country: 'US',
			startMonth: 6,
			endMonth: 8,
			ingredients: [randomUUID(), randomUUID(), randomUUID()],
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts empty ingredients array', () => {
		const validData = {
			name: 'Fall',
			country: 'US',
			startMonth: 9,
			endMonth: 11,
			ingredients: [],
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('defaults to empty array when ingredients not provided', () => {
		const validData = {
			name: 'Spring',
			country: 'US',
			startMonth: 3,
			endMonth: 5,
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(validData);
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			// Check that error is for ingredients array
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
			createdBy: randomUUID(),
		};

		const result = createSeasonSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('ingredients');
		}
	});
});

describe('UpdateSeason form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			name: 'Updated Winter',
			description: 'Updated description',
			country: 'CA',
			region: 'Quebec',
			startMonth: 12,
			endMonth: 2,
			notes: 'Updated notes',
			updatedBy: randomUUID(),
		};

		const result = updateSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid update with minimal required fields', () => {
		const validData = {
			id: randomUUID(),
			name: 'Spring',
			country: 'US',
			startMonth: 3,
			endMonth: 5,
			updatedBy: randomUUID(),
		};

		const result = updateSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with deletedBy', () => {
		const validData = {
			id: randomUUID(),
			name: 'Deleted Season',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			updatedBy: randomUUID(),
			deletedBy: randomUUID(),
		};

		const result = updateSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required id', () => {
		const invalidData = {
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			updatedBy: randomUUID(),
		};

		const result = updateSeasonSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects invalid UUID format for id', () => {
		const invalidData = {
			id: 'bad-uuid',
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			updatedBy: randomUUID(),
		};

		const result = updateSeasonSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('applies same validation rules as create schema', () => {
		// Invalid month
		const invalidMonth = {
			id: randomUUID(),
			name: 'Test',
			country: 'US',
			startMonth: 13,
			endMonth: 3,
			updatedBy: randomUUID(),
		};

		expect(updateSeasonSchema.safeParse(invalidMonth).success).toBe(false);

		// Invalid country
		const invalidCountry = {
			id: randomUUID(),
			name: 'Test',
			country: 'INVALID',
			startMonth: 1,
			endMonth: 3,
			updatedBy: randomUUID(),
		};

		expect(updateSeasonSchema.safeParse(invalidCountry).success).toBe(false);

		// Description too long
		const longDescription = {
			id: randomUUID(),
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			description: 'a'.repeat(501),
			updatedBy: randomUUID(),
		};

		expect(updateSeasonSchema.safeParse(longDescription).success).toBe(false);

		// Notes too long
		const longNotes = {
			id: randomUUID(),
			name: 'Test',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			notes: 'a'.repeat(2001),
			updatedBy: randomUUID(),
		};

		expect(updateSeasonSchema.safeParse(longNotes).success).toBe(false);
	});
	it('accepts update with ingredients', () => {
		const validData = {
			id: randomUUID(),
			name: 'Updated Season',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			ingredients: [randomUUID(), randomUUID()],
			updatedBy: randomUUID(),
		};

		const result = updateSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with empty ingredients array', () => {
		const validData = {
			id: randomUUID(),
			name: 'Updated Season',
			country: 'US',
			startMonth: 1,
			endMonth: 3,
			ingredients: [],
			updatedBy: randomUUID(),
		};

		const result = updateSeasonSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});
});

// describe('createSeasonSchema - ingredients', () => {
// 	it('accepts valid ingredients array', () => {
// 		const validData = {
// 			name: 'Spring Season',
// 			country: 'US',
// 			startMonth: 3,
// 			endMonth: 5,
// 			createdBy: crypto.randomUUID(),
// 			ingredients: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
// 		};

// 		const result = createSeasonSchema.safeParse(validData);
// 		expect(result.success).toBe(true);
// 		if (result.success) {
// 			expect(result.data.ingredients).toHaveLength(3);
// 		}
// 	});

// 	it('rejects ingredients with invalid UUIDs', () => {
// 		const invalidData = {
// 			name: 'Spring Season',
// 			country: 'US',
// 			startMonth: 3,
// 			endMonth: 5,
// 			createdBy: crypto.randomUUID(),
// 			ingredients: ['not-a-uuid', 'also-not-uuid'],
// 		};

// 		const result = createSeasonSchema.safeParse(invalidData);
// 		expect(result.success).toBe(false);
// 		if (!result.success) {
// 			expect(result.error.issues.some(i => i.path.includes('ingredients'))).toBe(true);
// 		}
// 	});

// 	it('defaults ingredients to empty array when not provided', () => {
// 		const data = {
// 			name: 'Spring Season',
// 			country: 'US',
// 			startMonth: 3,
// 			endMonth: 5,
// 			createdBy: crypto.randomUUID(),
// 			// No ingredients provided
// 		};

// 		const result = createSeasonSchema.safeParse(data);
// 		expect(result.success).toBe(true);
// 		if (result.success) {
// 			expect(result.data.ingredients).toEqual([]);
// 		}
// 	});

// 	it('accepts empty ingredients array', () => {
// 		const data = {
// 			name: 'Spring Season',
// 			country: 'US',
// 			startMonth: 3,
// 			endMonth: 5,
// 			createdBy: crypto.randomUUID(),
// 			ingredients: [],
// 		};

// 		const result = createSeasonSchema.safeParse(data);
// 		expect(result.success).toBe(true);
// 		if (result.success) {
// 			expect(result.data.ingredients).toEqual([]);
// 		}
// 	});

// 	it('accepts ingredients with optional fields populated', () => {
// 		const validData = {
// 			name: 'Summer Season',
// 			description: 'Hot summer months',
// 			country: 'US',
// 			region: 'Southwest',
// 			startMonth: 6,
// 			endMonth: 8,
// 			notes: 'Great for tomatoes',
// 			createdBy: crypto.randomUUID(),
// 			ingredients: [crypto.randomUUID(), crypto.randomUUID()],
// 		};

// 		const result = createSeasonSchema.safeParse(validData);
// 		expect(result.success).toBe(true);
// 		if (result.success) {
// 			expect(result.data.ingredients).toHaveLength(2);
// 			expect(result.data.description).toBe('Hot summer months');
// 			expect(result.data.region).toBe('Southwest');
// 			expect(result.data.notes).toBe('Great for tomatoes');
// 		}
// 	});
// });
