import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createCredentialSchema, updateCredentialSchema } from '../credentials';

describe('CreateCredential form schema', () => {
	it('accepts valid credential with all fields', () => {
		const validData = {
			userId: randomUUID(),
			credentialId: 'credential-abc123',
			publicKey: new Uint8Array([1, 2, 3, 4, 5]),
			counter: 0,
			name: 'My Security Key',
		};

		const result = createCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid credential with minimal required fields', () => {
		const validData = {
			userId: randomUUID(),
			credentialId: 'cred-xyz',
			publicKey: new Uint8Array([255, 254, 253]),
		};

		const result = createCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.counter).toBe(0); // Default value
		}
	});

	it('defaults counter to 0 when not provided', () => {
		const validData = {
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([10, 20, 30]),
		};

		const result = createCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.counter).toBe(0);
		}
	});

	it('accepts various counter values', () => {
		const counters = [0, 1, 100, 1000, 999999];

		counters.forEach(counter => {
			const validData = {
				userId: randomUUID(),
				credentialId: 'test-cred',
				publicKey: new Uint8Array([1]),
				counter,
			};

			const result = createCredentialSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from credentialId', () => {
		const validData = {
			userId: randomUUID(),
			credentialId: '  cred-123  ',
			publicKey: new Uint8Array([1, 2, 3]),
		};

		const result = createCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.credentialId).toBe('cred-123');
		}
	});

	it('trims whitespace from name', () => {
		const validData = {
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
			name: '  My Yubikey  ',
		};

		const result = createCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('My Yubikey');
		}
	});

	it('converts empty string name to undefined', () => {
		const validData = {
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
			name: '',
		};

		const result = createCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBeUndefined();
		}
	});

	it('coerces string counter to number', () => {
		const validData = {
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
			counter: '42' as any,
		};

		const result = createCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.counter).toBe(42);
			expect(typeof result.data.counter).toBe('number');
		}
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			name: 'Test Key',
		};

		const result = createCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('userId');
			expect(paths).toContain('credentialId');
			expect(paths).toContain('publicKey');
		}
	});

	it('rejects invalid UUID format for userId', () => {
		const invalidData = {
			userId: 'not-a-uuid',
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
		};

		const result = createCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('userId');
		}
	});

	it('rejects empty credentialId', () => {
		const invalidData = {
			userId: randomUUID(),
			credentialId: '',
			publicKey: new Uint8Array([1]),
		};

		const result = createCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('credentialId');
		}
	});

	it('rejects empty credentialId after trim', () => {
		const invalidData = {
			userId: randomUUID(),
			credentialId: '   ',
			publicKey: new Uint8Array([1]),
		};

		const result = createCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('credentialId');
		}
	});

	it('rejects non-Uint8Array publicKey', () => {
		const invalidData = {
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: [1, 2, 3] as any, // Regular array, not Uint8Array
		};

		const result = createCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('publicKey');
		}
	});

	it('rejects negative counter', () => {
		const invalidData = {
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
			counter: -1,
		};

		const result = createCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('counter');
		}
	});

	it('rejects decimal counter', () => {
		const invalidData = {
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
			counter: 5.5,
		};

		const result = createCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('counter');
		}
	});
});

describe('UpdateCredential form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			credentialId: 'updated-cred',
			publicKey: new Uint8Array([9, 8, 7]),
			counter: 42,
			name: 'Updated Key Name',
			lastUsedAt: new Date().toISOString(),
		};

		const result = updateCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid update with minimal required fields', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
		};

		const result = updateCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid ISO datetime for lastUsedAt', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
			lastUsedAt: '2024-01-15T10:30:00.000Z',
		};

		const result = updateCredentialSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required id', () => {
		const invalidData = {
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
		};

		const result = updateCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects invalid UUID format for id', () => {
		const invalidData = {
			id: 'bad-uuid',
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
		};

		const result = updateCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects invalid datetime format for lastUsedAt', () => {
		const invalidData = {
			id: randomUUID(),
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
			lastUsedAt: 'not-a-datetime',
		};

		const result = updateCredentialSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('lastUsedAt');
		}
	});

	it('applies same validation rules as create schema', () => {
		// Negative counter
		const negativeCounter = {
			id: randomUUID(),
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: new Uint8Array([1]),
			counter: -5,
		};
		expect(updateCredentialSchema.safeParse(negativeCounter).success).toBe(false);

		// Invalid publicKey
		const invalidKey = {
			id: randomUUID(),
			userId: randomUUID(),
			credentialId: 'test-cred',
			publicKey: 'not-uint8array' as any,
		};
		expect(updateCredentialSchema.safeParse(invalidKey).success).toBe(false);

		// Empty credentialId
		const emptyCredId = {
			id: randomUUID(),
			userId: randomUUID(),
			credentialId: '   ',
			publicKey: new Uint8Array([1]),
		};
		expect(updateCredentialSchema.safeParse(emptyCredId).success).toBe(false);
	});
});
