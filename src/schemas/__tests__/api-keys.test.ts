import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { apiKeysSchemas } from '@/schemas';

describe('Create API Key form schema', () => {
	it('accepts valid api key with all fields', () => {
		const validData = {
			userId: randomUUID(),
			permissions: ['recipes:upload'],
			name: 'key for the upload booklet',
			revokeAt: '2030-01-01',
		};

		const result = apiKeysSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('handles the id being provided as an empty string', () => {
		const validData = {
			id: '',
			userId: randomUUID(),
			permissions: ['recipes:upload'],
			name: 'key for the upload booklet',
			revokeAt: '2030-01-01',
		};

		const result = apiKeysSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects when revokeAt is missing', () => {
		const result = apiKeysSchemas.form.safeParse({
			userId: randomUUID(),
			permissions: ['recipes:upload'],
			name: 'key for the upload booklet',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.map(i => i.path[0])).toContain('revokeAt');
		}
	});

	it('rejects missing required fields', () => {
		const result = apiKeysSchemas.form.safeParse({
			userId: randomUUID(),
			name: 'key for the upload booklet',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('permissions');
			expect(paths).toContain('revokeAt');
		}
	});
});

describe('Update API Key form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			permissions: ['recipes:upload'],
			name: 'key for the upload booklet',
			revokeAt: '2030-01-01',
		};

		const result = apiKeysSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid update with minimal required fields', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'name for some new keys',
			permissions: ['recipes:upload'],
			revokeAt: '2030-01-01',
		};

		const result = apiKeysSchemas.form.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects missing required fields', () => {
		const result = apiKeysSchemas.form.safeParse({
			userId: randomUUID(),
			name: 'key for the upload booklet',
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('permissions');
			expect(paths).toContain('revokeAt');
		}
	});
});
