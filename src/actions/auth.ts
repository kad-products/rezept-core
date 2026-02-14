'use server';
import { env } from 'cloudflare:workers';
import {
	type AuthenticationResponseJSON,
	generateAuthenticationOptions,
	generateRegistrationOptions,
	type RegistrationResponseJSON,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { requestInfo } from 'rwsdk/worker';
import { UAParser as uap } from 'ua-parser-js';
import { createCredential, getCredentialById, updateCredentialCounter } from '@/repositories/credentials';
import { createUser, getUserById } from '@/repositories/users';
import { sessions } from '@/session/store';

function getWebAuthnConfig(request: Request) {
	const rpID = env.WEBAUTHN_RP_ID ?? new URL(request.url).hostname;
	const rpName = import.meta.env.VITE_IS_DEV_SERVER ? 'Development App' : env.WEBAUTHN_APP_NAME;
	return {
		rpName,
		rpID,
	};
}

export async function startPasskeyRegistration(username: string) {
	const { rpName, rpID } = getWebAuthnConfig(requestInfo.request);
	const { response } = requestInfo;

	const options = await generateRegistrationOptions({
		rpName,
		rpID,
		userName: username,
		authenticatorSelection: {
			// Require the authenticator to store the credential, enabling a username-less login experience
			residentKey: 'required',
			// Prefer user verification (biometric, PIN, etc.), but allow authentication even if it's not available
			userVerification: 'preferred',
		},
	});

	await sessions.save(response.headers, { challenge: options.challenge });

	return options;
}

export async function startPasskeyLogin() {
	const { rpID } = getWebAuthnConfig(requestInfo.request);
	const { response } = requestInfo;

	const options = await generateAuthenticationOptions({
		rpID,
		userVerification: 'preferred',
		allowCredentials: [],
	});

	await sessions.save(response.headers, { challenge: options.challenge });

	return options;
}

export async function finishPasskeyRegistration(username: string, registration: RegistrationResponseJSON) {
	const { request, response } = requestInfo;
	const { origin } = new URL(request.url);

	const session = await sessions.load(request);
	const challenge = session?.challenge;

	if (!challenge) {
		return false;
	}

	const verification = await verifyRegistrationResponse({
		response: registration,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
	});

	if (!verification.verified || !verification.registrationInfo) {
		return false;
	}

	await sessions.save(response.headers, { challenge: null });

	const user = await createUser(username);

	await createCredential({
		userId: user.id,
		credentialId: verification.registrationInfo.credential.id,
		publicKey: verification.registrationInfo.credential.publicKey,
		counter: verification.registrationInfo.credential.counter,
		name: deviceNameFromUA(request.headers.get('User-Agent') || ''),
	});

	return true;
}

function deviceNameFromUA(uaString: string) {
	const ua = new uap(uaString);
	const device = ua.getDevice();
	const os = ua.getOS();
	const browser = ua.getBrowser();

	const nameParts = [];

	if (device.vendor && device.model) {
		nameParts.push(`${device.vendor} ${device.model}`);
	} else if (device.model) {
		nameParts.push(device.model);
	}

	if (os.name && os.version) {
		nameParts.push(`${os.name} ${os.version}`);
	} else if (os.name) {
		nameParts.push(os.name);
	}

	if (browser.name && browser.version) {
		nameParts.push(`${browser.name} ${browser.version}`);
	} else if (browser.name) {
		nameParts.push(browser.name);
	}

	return nameParts.join(' | ') || 'Unknown Device';
}

export async function finishPasskeyLogin(login: AuthenticationResponseJSON) {
	const { request, response } = requestInfo;
	const { origin } = new URL(request.url);

	console.log(`Login: ${JSON.stringify(login, null, 4)}`);

	const session = await sessions.load(request);
	const challenge = session?.challenge;

	console.log(`Challenge: ${JSON.stringify(challenge, null, 4)}`);

	if (!challenge) {
		return false;
	}

	const credential = await getCredentialById(login.id);

	console.log(`Credential: ${JSON.stringify(credential, null, 4)}`);

	if (!credential) {
		return false;
	}

	const verification = await verifyAuthenticationResponse({
		response: login,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
		requireUserVerification: false,
		credential: {
			id: credential.credentialId,
			publicKey: credential.publicKey.slice(),
			counter: credential.counter,
		},
	});

	console.log(`Verification: ${JSON.stringify(verification, null, 4)}`);

	if (!verification.verified) {
		return false;
	}

	await updateCredentialCounter(login.id, verification.authenticationInfo.newCounter);

	const user = await getUserById(credential.userId);

	console.log(`User: ${JSON.stringify(user, null, 4)}`);

	if (!user) {
		return false;
	}

	await sessions.save(response.headers, {
		userId: user.id,
		challenge: null,
	});

	return true;
}
