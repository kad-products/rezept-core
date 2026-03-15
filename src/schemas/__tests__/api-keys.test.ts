import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { apiKeyFormSchema } from '@/schemas';

describe('Create API Key form schema', () => {
	it('accepts valid api key with all fields', () => {
		const validData = {
			userId: randomUUID(),
			permissions: ['recipes:import'],
			name: 'key for the import booklet',
			revokeAt: new Date().toISOString(),
		};

		const result = apiKeyFormSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid api key with required fields', () => {
		const validData = {
			userId: randomUUID(),
			permissions: ['recipes:import'],
			name: 'key for the import booklet',
		};

		const result = apiKeyFormSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('handles the id being provided as an empty string', () => {
		const validData = {
			id: '',
			userId: randomUUID(),
			permissions: ['recipes:import'],
			name: 'key for the import booklet',
		};

		const result = apiKeyFormSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			userId: randomUUID(),
			name: 'key for the import booklet',
		};

		const result = apiKeyFormSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('permissions');
		}
	});
});

describe('Update API Key form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			permissions: ['recipes:import'],
			name: 'key for the import booklet',
			revokeAt: new Date().toISOString(),
		};

		const result = apiKeyFormSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid update with minimal required fields', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'name for some new keys',
			permissions: ['recipes:import'],
		};

		const result = apiKeyFormSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			userId: randomUUID(),
			name: 'key for the import booklet',
		};

		const result = apiKeyFormSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('permissions');
		}
	});
});
