import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

vi.mock('@simplewebauthn/server', () => ({
	generateAuthenticationOptions: vi.fn(),
	verifyAuthenticationResponse: vi.fn(),
}));

vi.mock('@/durable-objects', () => ({
	sessions: {
		save: vi.fn(),
		load: vi.fn(),
	},
}));

vi.mock('@/repositories', () => ({
	getCredentialById: vi.fn(),
	getUserById: vi.fn(),
	updateCredentialCounter: vi.fn(),
}));

vi.mock('../webauthn', () => ({
	getWebAuthnConfig: vi.fn(() => ({
		rpName: 'Test App',
		rpID: 'example.com',
		origin: 'https://example.com',
	})),
}));

interface MockRequestInfo {
	request: Request;
	response: { headers: Headers };
	ctx: { logger: RzLogger };
}

const mockRequestInfo: MockRequestInfo = {
	request: new Request('https://example.com/'),
	response: { headers: new Headers() },
	ctx: { logger: new Logger() },
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { sessions } from '@/durable-objects';
import { getCredentialById, getUserById, updateCredentialCounter } from '@/repositories';
import { finishPasskeyLogin, startPasskeyLogin } from '../auth';

const mockOptions = {
	challenge: 'mock-auth-challenge',
	rpId: 'example.com',
	allowCredentials: [],
	userVerification: 'preferred',
	timeout: 60000,
};

// What a browser sends back after the user selects a passkey and their authenticator signs the challenge.
// The id here is the credential ID the authenticator chose from its stored keys.
const mockLogin = {
	id: 'credential-id',
	rawId: 'credential-id',
	response: {
		clientDataJSON: 'mock-client-data',
		authenticatorData: 'mock-authenticator-data',
		signature: 'mock-signature',
	},
	type: 'public-key' as const,
	clientExtensionResults: {},
};

// The credential record created during registration — the server's copy of the public key.
const mockCredential = {
	id: 'db-id',
	credentialId: 'credential-id',
	publicKey: new Uint8Array([1, 2, 3]),
	counter: 5,
	userId: 'user-id',
};

const mockUser = { id: 'user-id', username: 'testuser' };

const mockVerification = {
	verified: true,
	authenticationInfo: { newCounter: 6 },
};

describe('startPasskeyLogin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.REZEPT_ENV = 'development';
		vi.mocked(generateAuthenticationOptions).mockResolvedValue(mockOptions as any);
		vi.mocked(sessions.save).mockResolvedValue(undefined as any);
	});

	it('returns authentication options on success', async () => {
		const result = await startPasskeyLogin();
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockOptions);
	});

	// The challenge is a random value the browser must pass to the authenticator, which signs it.
	// Saving it to the session is what lets finishPasskeyLogin verify that the signed response
	// came from this server's ceremony and not from a replay of a captured response.
	it('saves the challenge to the session', async () => {
		await startPasskeyLogin();
		expect(sessions.save).toHaveBeenCalledWith(expect.anything(), { challenge: mockOptions.challenge });
	});

	// allowCredentials: [] means "any resident key on this device is allowed."
	// This is what enables username-less login — the user doesn't identify themselves upfront;
	// the authenticator picks the right key based on the rpID.
	it('does not restrict which credentials can be used', async () => {
		await startPasskeyLogin();
		expect(generateAuthenticationOptions).toHaveBeenCalledWith(expect.objectContaining({ allowCredentials: [] }));
	});

	it('returns an error when generateAuthenticationOptions throws', async () => {
		vi.mocked(generateAuthenticationOptions).mockRejectedValue(new Error('WebAuthn config error'));
		const result = await startPasskeyLogin();
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toBe('WebAuthn config error');
	});

	it('hides error details in production', async () => {
		mockEnv.REZEPT_ENV = 'production';
		vi.mocked(generateAuthenticationOptions).mockRejectedValue(new Error('Internal details'));
		const result = await startPasskeyLogin();
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toBe('Failed to start passkey login');
		expect(result.errors?._form?.[0]).not.toContain('Internal details');
	});
});

describe('finishPasskeyLogin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.REZEPT_ENV = 'development';
		vi.mocked(sessions.load).mockResolvedValue({ challenge: 'stored-challenge' } as any);
		vi.mocked(sessions.save).mockResolvedValue(undefined as any);
		vi.mocked(getCredentialById).mockResolvedValue(mockCredential as any);
		vi.mocked(verifyAuthenticationResponse).mockResolvedValue(mockVerification as any);
		vi.mocked(updateCredentialCounter).mockResolvedValue(undefined as any);
		vi.mocked(getUserById).mockResolvedValue(mockUser as any);
	});

	// The challenge links Phase 1 (start) to Phase 2 (finish). Without it the server has no
	// way to confirm that the signed response belongs to this ceremony rather than being replayed.
	it('returns an error when no challenge is in the session', async () => {
		vi.mocked(sessions.load).mockResolvedValue(null as any);
		const result = await finishPasskeyLogin(mockLogin as any);
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toContain('challenge');
	});

	it('returns an error when the session challenge has been cleared', async () => {
		vi.mocked(sessions.load).mockResolvedValue({ challenge: null } as any);
		const result = await finishPasskeyLogin(mockLogin as any);
		expect(result.success).toBe(false);
	});

	// login.id is the credential ID chosen by the authenticator. The server looks up its
	// stored public key to verify the signature — if there's no matching record this device
	// was never registered on this server.
	// getCredentialById throws (never returns null) so this is handled by an inner try/catch
	// that returns a 400, distinguishing it from unexpected 500 errors from the outer catch.
	it('returns a 400 error when getCredentialById throws', async () => {
		vi.mocked(getCredentialById).mockRejectedValue(new Error('getCredentialById: matchedCredentials length is 0'));
		const result = await finishPasskeyLogin(mockLogin as any);
		expect(result.success).toBe(false);
		expect(result.code).toBe(400);
		expect(result.errors?._form?.[0]).toContain('matchedCredentials');
	});

	it('hides credential lookup error details in production', async () => {
		mockEnv.REZEPT_ENV = 'production';
		vi.mocked(getCredentialById).mockRejectedValue(new Error('getCredentialById: matchedCredentials length is 0'));
		const result = await finishPasskeyLogin(mockLogin as any);
		expect(result.success).toBe(false);
		expect(result.code).toBe(400);
		expect(result.errors?._form?.[0]).toBe('Credential not found');
	});

	// verifyAuthenticationResponse cryptographically verifies the authenticator's signature
	// against the stored public key. It also checks the challenge, origin, and rpID match
	// what the server expects.
	it('returns an error when verification fails', async () => {
		vi.mocked(verifyAuthenticationResponse).mockResolvedValue({ verified: false } as any);
		const result = await finishPasskeyLogin(mockLogin as any);
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toContain('Invalid');
	});

	it('passes the stored public key and counter to verifyAuthenticationResponse', async () => {
		await finishPasskeyLogin(mockLogin as any);
		expect(verifyAuthenticationResponse).toHaveBeenCalledWith(
			expect.objectContaining({
				credential: expect.objectContaining({
					id: mockCredential.credentialId,
					counter: mockCredential.counter,
				}),
			}),
		);
	});

	// The counter increments with each use. The server updates it after a successful login
	// so it can detect if the counter ever goes backwards — a sign the authenticator was cloned.
	it('updates the credential counter after successful verification', async () => {
		await finishPasskeyLogin(mockLogin as any);
		expect(updateCredentialCounter).toHaveBeenCalledWith(
			mockLogin.id,
			mockVerification.authenticationInfo.newCounter,
			expect.any(String),
			expect.anything(),
		);
	});

	// getUserById throws (never returns null), caught by the outer try/catch.
	// Unlike getCredentialById it does not have its own inner catch, so it returns 500.
	it('returns a 500 error when getUserById throws', async () => {
		vi.mocked(getUserById).mockRejectedValue(new Error('getUserById: matchedUsers length is 0'));
		const result = await finishPasskeyLogin(mockLogin as any);
		expect(result.success).toBe(false);
		expect(result.code).toBe(500);
	});

	// Saving userId establishes the session — subsequent requests will see ctx.user set.
	// Clearing challenge simultaneously makes it single-use.
	it('saves the userId to the session and clears the challenge on success', async () => {
		await finishPasskeyLogin(mockLogin as any);
		expect(sessions.save).toHaveBeenCalledWith(expect.anything(), { userId: 'user-id', challenge: null });
	});

	it('returns success when all steps complete', async () => {
		const result = await finishPasskeyLogin(mockLogin as any);
		expect(result.success).toBe(true);
		expect(result.data).toBe(true);
	});
});
