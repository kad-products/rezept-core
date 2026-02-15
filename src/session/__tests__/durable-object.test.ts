import { beforeEach, describe, expect, it } from 'vitest';
import { type Session, SessionDurableObject } from '../durable-object';

// Mock Cloudflare Durable Object infrastructure
class MockDurableObjectStorage {
	private store = new Map<string, unknown>();

	async get<T>(key: string): Promise<T | undefined> {
		return this.store.get(key) as T | undefined;
	}

	async put<T>(key: string, value: T): Promise<void> {
		this.store.set(key, value);
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}
}

class MockDurableObjectState {
	storage = new MockDurableObjectStorage();
	id = { toString: () => 'test-session-id' };
	waitUntil = () => {};
	blockConcurrencyWhile = async (fn: () => Promise<void>) => await fn();
}

// Test class that allows time control
class TestSessionDurableObject extends SessionDurableObject {
	private mockTime: number = 1000000; // Start at a fixed time

	setTime(time: number) {
		this.mockTime = time;
	}

	protected now(): number {
		return this.mockTime;
	}
	// Test helper
	clearCache() {
		// biome-ignore lint/complexity/useLiteralKeys: accessing private parent property for testing
		this['session'] = undefined;
	}
}

describe('SessionDurableObject', () => {
	let session: TestSessionDurableObject;
	let mockState: MockDurableObjectState;
	let mockEnv: Cloudflare.Env;
	const START_TIME = 1000000;
	const MAX_SESSION_DURATION = 1209600000; // 14 days in ms

	beforeEach(() => {
		mockState = new MockDurableObjectState();
		mockEnv = {} as Cloudflare.Env;
		session = new TestSessionDurableObject(mockState as unknown as DurableObjectState, mockEnv);
		session.setTime(START_TIME);
	});

	describe('saveSession', () => {
		it('saves session with userId only', async () => {
			const saved = await session.saveSession({ userId: 'user-123' });

			expect(saved.userId).toBe('user-123');
			expect(saved.challenge).toBeNull();
			expect(saved.createdAt).toBe(START_TIME);
			expect(saved.lastAccessedAt).toBe(START_TIME);
		});

		it('saves session with challenge only', async () => {
			const saved = await session.saveSession({ challenge: 'challenge-abc' });

			expect(saved.userId).toBeNull();
			expect(saved.challenge).toBe('challenge-abc');
			expect(saved.createdAt).toBe(START_TIME);
		});

		it('saves session with both userId and challenge', async () => {
			const saved = await session.saveSession({
				userId: 'user-123',
				challenge: 'challenge-abc',
			});

			expect(saved.userId).toBe('user-123');
			expect(saved.challenge).toBe('challenge-abc');
		});

		it('saves empty session (neither userId nor challenge)', async () => {
			const saved = await session.saveSession({});

			expect(saved.userId).toBeNull();
			expect(saved.challenge).toBeNull();
			expect(saved.createdAt).toBe(START_TIME);
		});

		it('sets createdAt and lastAccessedAt to current time', async () => {
			session.setTime(5000000);
			const saved = await session.saveSession({ userId: 'user-123' });

			expect(saved.createdAt).toBe(5000000);
			expect(saved.lastAccessedAt).toBe(5000000);
		});

		it('persists session to storage', async () => {
			await session.saveSession({ userId: 'user-123' });

			const stored = await mockState.storage.get<Session>('session');
			expect(stored?.userId).toBe('user-123');
			expect(stored?.createdAt).toBe(START_TIME);
		});

		it('overwrites existing session', async () => {
			await session.saveSession({ userId: 'user-1' });

			session.setTime(START_TIME + 1000);
			await session.saveSession({ userId: 'user-2' });

			const result = await session.getSession();
			if ('value' in result) {
				expect(result.value.userId).toBe('user-2');
				expect(result.value.createdAt).toBe(START_TIME + 1000);
			}
		});

		it('updates in-memory cache', async () => {
			await session.saveSession({ userId: 'user-123' });

			// Get without accessing storage (uses cache)
			const result = await session.getSession();

			if ('value' in result) {
				expect(result.value.userId).toBe('user-123');
			}
		});
	});

	describe('getSession', () => {
		it('returns session after save', async () => {
			await session.saveSession({ userId: 'user-123' });

			const result = await session.getSession();

			expect('value' in result).toBe(true);
			if ('value' in result) {
				expect(result.value.userId).toBe('user-123');
				expect(result.value.createdAt).toBe(START_TIME);
			}
		});

		it('returns error when no session exists', async () => {
			const result = await session.getSession();

			expect('error' in result).toBe(true);
			if ('error' in result) {
				expect(result.error).toBe('Invalid session');
			}
		});

		it('uses cached session on subsequent calls', async () => {
			await session.saveSession({ userId: 'user-123' });

			// First call
			await session.getSession();

			// Manually clear storage to verify cache is used
			await mockState.storage.delete('session');

			// Should still work from cache
			const result = await session.getSession();
			expect('value' in result).toBe(true);
		});

		it('updates lastAccessedAt on cached read', async () => {
			await session.saveSession({ userId: 'user-123' });

			// Advance time
			session.setTime(START_TIME + 5000);

			const result = await session.getSession();

			if ('value' in result) {
				expect(result.value.lastAccessedAt).toBe(START_TIME + 5000);
			}
		});

		it('updates lastAccessedAt in storage on cached read', async () => {
			await session.saveSession({ userId: 'user-123' });

			session.setTime(START_TIME + 5000);
			await session.getSession();

			const stored = await mockState.storage.get<Session>('session');
			expect(stored?.lastAccessedAt).toBe(START_TIME + 5000);
		});

		it('updates lastAccessedAt on storage read', async () => {
			await session.saveSession({ userId: 'user-123' });

			session.clearCache();

			session.setTime(START_TIME + 10000);
			const result = await session.getSession();

			if ('value' in result) {
				expect(result.value.lastAccessedAt).toBe(START_TIME + 10000);
			}
		});

		it('returns error for expired session based on lastAccessedAt', async () => {
			await session.saveSession({ userId: 'user-123' });

			session.clearCache();

			// Advance past expiration
			session.setTime(START_TIME + MAX_SESSION_DURATION + 1);

			const result = await session.getSession();

			expect('error' in result).toBe(true);
			if ('error' in result) {
				expect(result.error).toBe('Session expired');
			}
		});

		it('revokes expired session from storage', async () => {
			await session.saveSession({ userId: 'user-123' });

			session.clearCache();
			session.setTime(START_TIME + MAX_SESSION_DURATION + 1);

			await session.getSession();

			const stored = await mockState.storage.get<Session>('session');
			expect(stored).toBeUndefined();
		});

		it('accepts session that has not expired', async () => {
			await session.saveSession({ userId: 'user-123' });

			session.clearCache();

			// Advance but not past expiration
			session.setTime(START_TIME + 1000000);

			const result = await session.getSession();

			expect('value' in result).toBe(true);
			if ('value' in result) {
				expect(result.value.userId).toBe('user-123');
			}
		});

		it('accepts session exactly at expiration boundary', async () => {
			await session.saveSession({ userId: 'user-123' });

			session.clearCache();

			// Exactly at expiration (should still be valid)
			session.setTime(START_TIME + MAX_SESSION_DURATION);

			const result = await session.getSession();

			expect('value' in result).toBe(true);
		});

		it('sliding expiration extends session lifetime', async () => {
			await session.saveSession({ userId: 'user-123' });

			// Access session partway through duration
			session.setTime(START_TIME + MAX_SESSION_DURATION / 2);
			await session.getSession();

			// Clear cache
			session.clearCache();

			// Advance past original expiration but within new window
			session.setTime(START_TIME + MAX_SESSION_DURATION + 1000);

			const result = await session.getSession();

			// Should still be valid because lastAccessedAt was updated
			expect('value' in result).toBe(true);
		});
	});

	describe('revokeSession', () => {
		it('clears session from storage', async () => {
			await session.saveSession({ userId: 'user-123' });
			await session.revokeSession();

			const stored = await mockState.storage.get<Session>('session');
			expect(stored).toBeUndefined();
		});

		it('clears cached session', async () => {
			await session.saveSession({ userId: 'user-123' });
			await session.revokeSession();

			const result = await session.getSession();
			expect('error' in result).toBe(true);
			if ('error' in result) {
				expect(result.error).toBe('Invalid session');
			}
		});

		it('handles revoking non-existent session', async () => {
			await expect(session.revokeSession()).resolves.not.toThrow();
		});

		it('can save new session after revoke', async () => {
			await session.saveSession({ userId: 'user-1' });
			await session.revokeSession();

			session.setTime(START_TIME + 5000);
			await session.saveSession({ userId: 'user-2' });

			const result = await session.getSession();
			if ('value' in result) {
				expect(result.value.userId).toBe('user-2');
				expect(result.value.createdAt).toBe(START_TIME + 5000);
			}
		});

		it('multiple revokes do not error', async () => {
			await session.saveSession({ userId: 'user-123' });
			await session.revokeSession();
			await session.revokeSession();
			await session.revokeSession();

			const result = await session.getSession();
			expect('error' in result).toBe(true);
		});
	});

	describe('WebAuthn challenge flow', () => {
		it('supports challenge creation before authentication', async () => {
			// Step 1: Create session with challenge
			const withChallenge = await session.saveSession({ challenge: 'abc123' });
			expect(withChallenge.challenge).toBe('abc123');
			expect(withChallenge.userId).toBeNull();

			// Step 2: Verify challenge exists
			let result = await session.getSession();
			if ('value' in result) {
				expect(result.value.challenge).toBe('abc123');
			}

			// Step 3: Complete auth with userId, clearing challenge
			session.setTime(START_TIME + 1000);
			await session.saveSession({ userId: 'user-123' });

			result = await session.getSession();
			if ('value' in result) {
				expect(result.value.userId).toBe('user-123');
				expect(result.value.challenge).toBeNull();
			}
		});

		it('challenge-only session can expire', async () => {
			await session.saveSession({ challenge: 'abc123' });

			session.clearCache();
			session.setTime(START_TIME + MAX_SESSION_DURATION + 1);

			const result = await session.getSession();
			expect('error' in result).toBe(true);
		});
	});

	describe('session lifecycle scenarios', () => {
		it('supports full create-read-revoke cycle', async () => {
			// Create
			const created = await session.saveSession({ userId: 'user-123' });
			expect(created.userId).toBe('user-123');

			// Read
			const read = await session.getSession();
			expect('value' in read).toBe(true);

			// Revoke
			await session.revokeSession();

			// Verify revoked
			const afterRevoke = await session.getSession();
			expect('error' in afterRevoke).toBe(true);
		});

		it('session survives cache clear if not expired', async () => {
			await session.saveSession({ userId: 'user-123' });

			// Simulate cache eviction
			session.clearCache();

			// Should reload from storage
			const result = await session.getSession();
			expect('value' in result).toBe(true);
			if ('value' in result) {
				expect(result.value.userId).toBe('user-123');
			}
		});

		it('repeated access keeps session alive indefinitely', async () => {
			await session.saveSession({ userId: 'user-123' });

			// Access every day for 30 days (beyond original 14 day limit)
			const dayInMs = 24 * 60 * 60 * 1000;

			for (let day = 1; day <= 30; day++) {
				session.setTime(START_TIME + day * dayInMs);
				session.clearCache(); // Force storage read

				const result = await session.getSession();
				expect('value' in result).toBe(true);
			}
		});

		it('inactive session expires after 14 days', async () => {
			await session.saveSession({ userId: 'user-123' });

			// Don't access it
			session.clearCache();
			session.setTime(START_TIME + MAX_SESSION_DURATION + 1);

			const result = await session.getSession();
			expect('error' in result).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('handles session with empty string userId', async () => {
			const saved = await session.saveSession({ userId: '' });

			expect(saved.userId).toBe('');
		});

		it('handles session with empty string challenge', async () => {
			const saved = await session.saveSession({ challenge: '' });

			expect(saved.challenge).toBe('');
		});

		it('handles very long userId', async () => {
			const longId = 'x'.repeat(1000);
			const saved = await session.saveSession({ userId: longId });

			expect(saved.userId).toBe(longId);
		});

		it('handles special characters in challenge', async () => {
			const challenge = 'special!@#$%^&*()_+-={}[]|:;<>?,./';
			const saved = await session.saveSession({ challenge });

			expect(saved.challenge).toBe(challenge);
		});

		it('maintains separate createdAt and lastAccessedAt', async () => {
			await session.saveSession({ userId: 'user-123' });

			session.setTime(START_TIME + 50000);
			const result = await session.getSession();

			if ('value' in result) {
				expect(result.value.createdAt).toBe(START_TIME);
				expect(result.value.lastAccessedAt).toBe(START_TIME + 50000);
				expect(result.value.createdAt).not.toBe(result.value.lastAccessedAt);
			}
		});
	});
});
