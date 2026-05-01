import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { ingredientsSchemas } from '../ingredients';

describe('ingredientsSchemas.form', () => {
	it('accepts valid ingredient with all fields', () => {
		const validData = {
			name: 'Tomatoes',
			description: 'Fresh red tomatoes',
		};

		const result = ingredientsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid ingredient with minimal required fields', () => {
		const validData = {
			name: 'Garlic',
		};

		const result = ingredientsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts various valid ingredient names', () => {
		const validNames = [
			'Salt',
			'Black Pepper',
			'Extra Virgin Olive Oil',
			'Chicken Breast',
			'All-Purpose Flour',
			'Granny Smith Apples',
			'Unsalted Butter',
		];

		validNames.forEach(name => {
			const result = ingredientsSchemas.form.safeParse({ name });
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from name', () => {
		const validData = {
			name: '  Basil  ',
		};

		const result = ingredientsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Basil');
		}
	});

	it('trims whitespace from description', () => {
		const validData = {
			name: 'Oregano',
			description: '  Dried oregano leaves  ',
		};

		const result = ingredientsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('Dried oregano leaves');
		}
	});

	it('converts empty string description to undefined', () => {
		const validData = {
			name: 'Thyme',
			description: '',
		};

		const result = ingredientsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeUndefined();
		}
	});

	it('rejects missing name', () => {
		const invalidData = {
			description: 'Test description',
		};

		const result = ingredientsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('rejects empty name', () => {
		const result = ingredientsSchemas.form.safeParse({ name: '' });
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('rejects empty name after trim', () => {
		const result = ingredientsSchemas.form.safeParse({ name: '   ' });
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('rejects name longer than 100 characters', () => {
		const result = ingredientsSchemas.form.safeParse({ name: 'a'.repeat(101) });
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('accepts name exactly 100 characters', () => {
		const result = ingredientsSchemas.form.safeParse({ name: 'a'.repeat(100) });
		expect(result.success).toBe(true);
	});

	it('rejects description longer than 500 characters', () => {
		const invalidData = {
			name: 'Test',
			description: 'a'.repeat(501),
		};

		const result = ingredientsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('description');
		}
	});

	it('accepts description exactly 500 characters', () => {
		const validData = {
			name: 'Test',
			description: 'a'.repeat(500),
		};

		const result = ingredientsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts ingredient without id (create)', () => {
		const result = ingredientsSchemas.form.safeParse({ name: 'Basil' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBeUndefined();
		}
	});

	it('accepts ingredient with valid id (update)', () => {
		const validData = {
			id: randomUUID(),
			name: 'Updated Tomatoes',
			description: 'Updated description',
		};

		const result = ingredientsSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID format for id when present', () => {
		const invalidData = {
			id: 'bad-uuid',
			name: 'Test',
		};

		const result = ingredientsSchemas.form.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});
});
