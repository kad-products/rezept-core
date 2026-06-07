'use server';
import {
	type AuthenticationResponseJSON,
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { requestInfo } from 'rwsdk/worker';
import { trackLoginAttempt } from '@/analytics';
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
		trackLoginAttempt({
			type: 'PASSKEY',
			stage: 'START',
			success: true,
		});
		return successResponse(options);
	} catch (err) {
		trackLoginAttempt({
			type: 'PASSKEY',
			stage: 'START',
			success: false,
		});

		return errorResponse(err, 500, 'Failed to start passkey login');
	}
}

export async function finishPasskeyLogin(login: AuthenticationResponseJSON): Promise<ActionState<boolean>> {
	try {
		const { request, response } = requestInfo;
		const { origin } = getWebAuthnConfig(requestInfo.request);

		const taskLogger = requestInfo.ctx.logger.child({ task: 'passkey-login' });
		taskLogger.debug('Passkey login attempt', { credentialId: login.id });

		const session = await sessions.load(request);
		const challenge = session?.challenge;

		if (!challenge) {
			trackLoginAttempt({
				type: 'PASSKEY',
				stage: 'FINISH',
				success: false,
			});

			return errorResponse('No challenge found in session', 400);
		}

		let credential: CredentialDBRead;
		try {
			credential = await getCredentialById(login.id, taskLogger);

			taskLogger.debug('Credential found', { credentialId: credential.credentialId, userId: credential.userId });
		} catch (err) {
			trackLoginAttempt({
				type: 'PASSKEY',
				stage: 'FINISH',
				success: false,
			});
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

		taskLogger.debug('Passkey verification result', { verified: verification.verified });

		if (!verification.verified) {
			trackLoginAttempt({
				type: 'PASSKEY',
				stage: 'FINISH',
				success: false,
			});
			return errorResponse('Invalid passkey login', 400);
		}

		await updateCredentialCounter(
			login.id,
			verification.authenticationInfo.newCounter,
			credential.userId,
			requestInfo.ctx.logger,
		);

		const user = await getUserById(credential.userId, requestInfo.ctx.logger);

		taskLogger.debug('User resolved', { userId: user.id });

		await sessions.save(response.headers, {
			userId: user.id,
			challenge: null,
		});

		trackLoginAttempt({
			type: 'PASSKEY',
			stage: 'FINISH',
			success: true,
			userId: user.id,
		});

		return successResponse(true);
	} catch (err) {
		trackLoginAttempt({
			type: 'PASSKEY',
			stage: 'FINISH',
			success: false,
		});
		return errorResponse(err, 500, 'Failed to finish passkey login');
	}
}
