'use server';
import {
	type AuthenticationResponseJSON,
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { requestInfo } from 'rwsdk/worker';
import { sessions } from '@/durable-objects';
import { getCredentialById, getUserById, updateCredentialCounter } from '@/repositories';
import type { ActionState, CredentialDBRead } from '@/types';
import { errorResponse, successResponse } from './utils';
import { getWebAuthnConfig } from './webauthn';

// No serverAction() wrapper — these functions have no meaningful interruptors. See src/actions/readme.md.

export async function startPasskeyLogin(): Promise<ActionState<PublicKeyCredentialRequestOptionsJSON>> {
	try {
		const { rpID } = getWebAuthnConfig(requestInfo.request);
		const { response } = requestInfo;

		const options = await generateAuthenticationOptions({
			rpID,
			userVerification: 'preferred',
			allowCredentials: [],
		});

		await sessions.save(response.headers, { challenge: options.challenge });

		return successResponse(options);
	} catch (err) {
		return errorResponse(err, 500, 'Failed to start passkey login');
	}
}

export async function finishPasskeyLogin(login: AuthenticationResponseJSON): Promise<ActionState<boolean>> {
	try {
		const { request, response } = requestInfo;
		const { origin } = getWebAuthnConfig(requestInfo.request);

		requestInfo.ctx.logger.info(`Login: ${JSON.stringify(login, null, 4)}`);

		const session = await sessions.load(request);
		const challenge = session?.challenge;

		requestInfo.ctx.logger.info(`Challenge: ${JSON.stringify(challenge, null, 4)}`);

		if (!challenge) {
			return errorResponse('No challenge found in session', 400);
		}

		let credential: CredentialDBRead;
		try {
			credential = await getCredentialById(login.id, requestInfo.ctx.logger);

			requestInfo.ctx.logger.info(`Credential: ${JSON.stringify(credential, null, 4)}`);
		} catch (err) {
			return errorResponse(err, 400, 'Credential not found');
		}

		const verification = await verifyAuthenticationResponse({
			response: login,
			expectedChallenge: challenge,
			expectedOrigin: origin,
			expectedRPID: new URL(request.url).hostname,
			requireUserVerification: false,
			credential: {
				id: credential.credentialId,
				publicKey: credential.publicKey.slice(),
				counter: credential.counter,
			},
		});

		requestInfo.ctx.logger.info(`Verification: ${JSON.stringify(verification, null, 4)}`);

		if (!verification.verified) {
			return errorResponse('Invalid passkey login', 400);
		}

		await updateCredentialCounter(
			login.id,
			verification.authenticationInfo.newCounter,
			credential.userId,
			requestInfo.ctx.logger,
		);

		const user = await getUserById(credential.userId, requestInfo.ctx.logger);

		requestInfo.ctx.logger.info(`User: ${JSON.stringify(user, null, 4)}`);

		if (!user) {
			return errorResponse('No user found', 400);
		}

		await sessions.save(response.headers, {
			userId: user.id,
			challenge: null,
		});

		return successResponse(true);
	} catch (err) {
		return errorResponse(err, 500, 'Failed to finish passkey login');
	}
}
