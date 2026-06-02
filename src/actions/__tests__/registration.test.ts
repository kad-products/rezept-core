import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

vi.mock('@simplewebauthn/server', () => ({
	generateRegistrationOptions: vi.fn(),
	verifyRegistrationResponse: vi.fn(),
}));

vi.mock('@/durable-objects', () => ({
	sessions: {
		save: vi.fn(),
		load: vi.fn(),
	},
}));

vi.mock('@/repositories', () => ({
	createCredential: vi.fn(),
	createUser: vi.fn(),
}));

vi.mock('../webauthn', () => ({
	getWebAuthnConfig: vi.fn(() => ({
		rpName: 'Test App',
		rpID: 'example.com',
		origin: 'https://example.com',
	})),
}));

const mockUAGetDevice = vi.hoisted(() => vi.fn(() => ({}) as { vendor?: string; model?: string; type?: string }));
const mockUAGetOS = vi.hoisted(() => vi.fn(() => ({}) as { name?: string; version?: string }));
const mockUAGetBrowser = vi.hoisted(() => vi.fn(() => ({}) as { name?: string; version?: string }));

vi.mock('ua-parser-js', () => ({
	UAParser: class {
		getDevice() {
			return mockUAGetDevice();
		}
		getOS() {
			return mockUAGetOS();
		}
		getBrowser() {
			return mockUAGetBrowser();
		}
	},
}));

interface MockRequestInfo {
	request: Request;
	response: { headers: Headers };
	ctx: { logger: RzLogger };
}

const mockRequestInfo: MockRequestInfo = {
	// The UA string here exercises ua-parser-js for the deviceNameFromUA path
	request: new Request('https://example.com/', {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		},
	}),
	response: { headers: new Headers() },
	ctx: { logger: new Logger() },
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { sessions } from '@/durable-objects';
import { createCredential, createUser } from '@/repositories';
import { finishPasskeyRegistration, startPasskeyRegistration } from '../registration';

const mockOptions = {
	challenge: 'mock-registration-challenge',
	rp: { id: 'example.com', name: 'Test App' },
	user: { id: new Uint8Array([1]), name: 'testuser', displayName: 'testuser' },
	pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
	timeout: 60000,
	attestation: 'none',
	authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
	excludeCredentials: [],
	extensions: {},
};

// This is what a real browser sends back after the user touches their authenticator.
// The shape is defined by the W3C WebAuthn spec — don't change it.
const mockRegistration = {
	id: 'credential-id',
	rawId: 'credential-id',
	response: {
		clientDataJSON: 'mock-client-data',
		attestationObject: 'mock-attestation',
	},
	type: 'public-key' as const,
	clientExtensionResults: {},
};

// What verifyRegistrationResponse returns when the ceremony succeeds.
// registrationInfo.credential is extracted from the authenticator's attestation object.
const mockVerification = {
	verified: true,
	registrationInfo: {
		credential: {
			id: 'credential-id',
			publicKey: new Uint8Array([1, 2, 3]),
			counter: 0,
		},
	},
};

const mockUser = { id: 'user-id', username: 'testuser' };

describe('startPasskeyRegistration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.REZEPT_ENV = 'development';
		vi.mocked(generateRegistrationOptions).mockResolvedValue(mockOptions as any);
		vi.mocked(sessions.save).mockResolvedValue(undefined as any);
	});

	it('returns registration options on success', async () => {
		const result = await startPasskeyRegistration('testuser');
		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockOptions);
	});

	it('passes the username to generateRegistrationOptions', async () => {
		await startPasskeyRegistration('myuser');
		expect(generateRegistrationOptions).toHaveBeenCalledWith(expect.objectContaining({ userName: 'myuser' }));
	});

	// The challenge is a random server-generated value that the authenticator must sign.
	// Saving it to the session is what lets finishPasskeyRegistration verify the response
	// came from this server's ceremony and not a replay of a previous one.
	it('saves the challenge to the session', async () => {
		await startPasskeyRegistration('testuser');
		expect(sessions.save).toHaveBeenCalledWith(expect.anything(), { challenge: mockOptions.challenge });
	});

	it('returns a validation error for an invalid username', async () => {
		const result = await startPasskeyRegistration('');
		expect(result.success).toBe(false);
		expect(result.errors?.username).toBeDefined();
		expect(generateRegistrationOptions).not.toHaveBeenCalled();
	});

	it('returns an error when generateRegistrationOptions throws', async () => {
		vi.mocked(generateRegistrationOptions).mockRejectedValue(new Error('WebAuthn unavailable'));
		const result = await startPasskeyRegistration('testuser');
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toBe('WebAuthn unavailable');
	});

	it('hides error details in production', async () => {
		mockEnv.REZEPT_ENV = 'production';
		vi.mocked(generateRegistrationOptions).mockRejectedValue(new Error('Internal config error'));
		const result = await startPasskeyRegistration('testuser');
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toBe('Failed to start passkey registration');
		expect(result.errors?._form?.[0]).not.toContain('Internal config error');
	});
});

describe('finishPasskeyRegistration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.REZEPT_ENV = 'development';
		mockRequestInfo.request = new Request('https://example.com/', {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			},
		});
		mockUAGetDevice.mockReturnValue({ vendor: 'Apple', model: 'MacBook', type: undefined });
		mockUAGetOS.mockReturnValue({ name: 'macOS', version: '14.0' });
		mockUAGetBrowser.mockReturnValue({ name: 'Chrome', version: '120.0' });
		vi.mocked(sessions.load).mockResolvedValue({ challenge: 'stored-challenge' } as any);
		vi.mocked(sessions.save).mockResolvedValue(undefined as any);
		vi.mocked(verifyRegistrationResponse).mockResolvedValue(mockVerification as any);
		vi.mocked(createUser).mockResolvedValue(mockUser as any);
		vi.mocked(createCredential).mockResolvedValue({} as any);
	});

	// The challenge links Phase 1 (start) to Phase 2 (finish). If it's missing from the
	// session the user either skipped Phase 1 or the session expired — the ceremony cannot proceed.
	it('returns an error when no challenge is in the session', async () => {
		vi.mocked(sessions.load).mockResolvedValue(null as any);
		const result = await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toContain('challenge');
	});

	it('returns an error when the session challenge has been cleared', async () => {
		vi.mocked(sessions.load).mockResolvedValue({ challenge: null } as any);
		const result = await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(result.success).toBe(false);
	});

	// verifyRegistrationResponse checks the cryptographic attestation from the authenticator:
	// it confirms the response was signed with the private key that matches the stored challenge,
	// came from the expected origin, and targets the correct rpID (the site's domain).
	it('returns an error when verification fails', async () => {
		vi.mocked(verifyRegistrationResponse).mockResolvedValue({ verified: false } as any);
		const result = await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toContain('Invalid');
	});

	it('returns an error when verification succeeds but registrationInfo is missing', async () => {
		vi.mocked(verifyRegistrationResponse).mockResolvedValue({ verified: true, registrationInfo: undefined } as any);
		const result = await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(result.success).toBe(false);
	});

	// The challenge is single-use. After a successful ceremony it must be cleared so the same
	// authenticator response can't be replayed to register again.
	it('clears the challenge from the session after successful verification', async () => {
		await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(sessions.save).toHaveBeenCalledWith(expect.anything(), { challenge: null });
	});

	it('creates a new user with the provided username', async () => {
		await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(createUser).toHaveBeenCalledWith('testuser', null, expect.anything());
	});

	// The credential record is what the server uses in future logins to verify the user.
	// publicKey is used to verify the signature; counter detects cloned authenticators.
	it('stores the credential with the public key and counter from the verified response', async () => {
		await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(createCredential).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-id',
				credentialId: 'credential-id',
				publicKey: mockVerification.registrationInfo.credential.publicKey,
				counter: 0,
			}),
			'user-id',
			expect.anything(),
		);
	});

	it('includes a device name derived from the User-Agent header', async () => {
		await finishPasskeyRegistration('testuser', mockRegistration as any);
		const [credentialData] = vi.mocked(createCredential).mock.calls[0];
		expect(typeof credentialData.name).toBe('string');
		expect(credentialData.name?.length).toBeGreaterThan(0);
	});

	it('falls back to "Unknown Device" when ua-parser-js returns no recognisable fields', async () => {
		mockUAGetDevice.mockReturnValueOnce({});
		mockUAGetOS.mockReturnValueOnce({});
		mockUAGetBrowser.mockReturnValueOnce({});
		await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(createCredential).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'Unknown Device' }),
			'user-id',
			expect.anything(),
		);
	});

	it('includes device model without vendor in device name', async () => {
		mockUAGetDevice.mockReturnValueOnce({ model: 'Smart TV' });
		await finishPasskeyRegistration('testuser', mockRegistration as any);
		const [credentialData] = vi.mocked(createCredential).mock.calls[0];
		expect(credentialData.name).toContain('Smart TV');
	});

	it('includes OS name without version in device name', async () => {
		mockUAGetDevice.mockReturnValueOnce({});
		mockUAGetOS.mockReturnValueOnce({ name: 'Linux' });
		await finishPasskeyRegistration('testuser', mockRegistration as any);
		const [credentialData] = vi.mocked(createCredential).mock.calls[0];
		expect(credentialData.name).toContain('Linux');
	});

	it('includes browser name without version in device name', async () => {
		mockUAGetDevice.mockReturnValueOnce({});
		mockUAGetOS.mockReturnValueOnce({});
		mockUAGetBrowser.mockReturnValueOnce({ name: 'HeadlessChrome' });
		await finishPasskeyRegistration('testuser', mockRegistration as any);
		const [credentialData] = vi.mocked(createCredential).mock.calls[0];
		expect(credentialData.name).toContain('HeadlessChrome');
	});

	it('returns a validation error for an invalid username', async () => {
		const result = await finishPasskeyRegistration('', mockRegistration as any);
		expect(result.success).toBe(false);
		expect(result.errors?.username).toBeDefined();
		expect(createUser).not.toHaveBeenCalled();
	});

	it('returns success when all steps complete', async () => {
		const result = await finishPasskeyRegistration('testuser', mockRegistration as any);
		expect(result.success).toBe(true);
		expect(result.data).toBe(true);
	});
});
