'use server';
import { generateRegistrationOptions, type RegistrationResponseJSON, verifyRegistrationResponse } from '@simplewebauthn/server';
import { requestInfo } from 'rwsdk/worker';
import { UAParser as uap } from 'ua-parser-js';
import { sessions } from '@/durable-objects';
import { createCredential, createUser } from '@/repositories';
import { usersSchemas } from '@/schemas';
import type { ActionState } from '@/types';
import { errorResponse, successResponse } from './utils';
import { getWebAuthnConfig } from './webauthn';

export async function startPasskeyRegistration(username: string): Promise<ActionState<PublicKeyCredentialCreationOptionsJSON>> {
	const parsed = usersSchemas.form.safeParse({ username });
	if (!parsed.success) {
		return errorResponse(parsed.error.flatten().fieldErrors, 400);
	}

	try {
		const { rpName, rpID } = getWebAuthnConfig(requestInfo.request);
		const { response } = requestInfo;

		const options = await generateRegistrationOptions({
			rpName,
			rpID,
			userName: parsed.data.username,
			authenticatorSelection: {
				// Require the authenticator to store the credential, enabling a username-less login experience
				residentKey: 'required',
				// Prefer user verification (biometric, PIN, etc.), but allow authentication even if it's not available
				userVerification: 'preferred',
			},
		});

		await sessions.save(response.headers, { challenge: options.challenge });

		return successResponse(options);
	} catch (err) {
		return errorResponse(err, 500, 'Failed to start passkey registration');
	}
}

export async function finishPasskeyRegistration(
	username: string,
	registration: RegistrationResponseJSON,
): Promise<ActionState<boolean>> {
	const { request, response } = requestInfo;
	const { origin } = getWebAuthnConfig(requestInfo.request);

	const session = await sessions.load(request);
	const challenge = session?.challenge;

	if (!challenge) {
		return errorResponse('No challenge found in session', 400);
	}

	const verification = await verifyRegistrationResponse({
		response: registration,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: new URL(request.url).hostname,
	});

	if (!verification.verified || !verification.registrationInfo) {
		return errorResponse('Invalid passkey registration', 400);
	}

	await sessions.save(response.headers, { challenge: null });

	const userParsed = usersSchemas.form.safeParse({ username });
	if (!userParsed.success) {
		return errorResponse(userParsed.error.flatten().fieldErrors, 400);
	}

	const user = await createUser(userParsed.data.username, null, requestInfo.ctx.logger);

	await createCredential(
		{
			userId: user.id,
			credentialId: verification.registrationInfo.credential.id,
			publicKey: verification.registrationInfo.credential.publicKey,
			counter: verification.registrationInfo.credential.counter,
			name: deviceNameFromUA(request.headers.get('User-Agent') || ''),
		},
		requestInfo.ctx.logger,
	);

	return successResponse(true);
}

function deviceNameFromUA(uaString: string): string {
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
