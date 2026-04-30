'use client';
import { type PublicKeyCredentialRequestOptionsJSON, startAuthentication } from '@simplewebauthn/browser';
import { useState, useTransition } from 'react';
import { navigate } from 'rwsdk/client';
import { finishPasskeyLogin, startPasskeyLogin } from '@/actions';

export default function PasskeyLogin(): React.ReactNode {
	const [result, setResult] = useState('');
	const [isPending, startTransition] = useTransition();

	const passkeyLogin = async (): Promise<void> => {
		try {
			// 1. Get a challenge from the worker
			const startResult = await startPasskeyLogin();
			if (!startResult.success || !startResult.data) {
				setResult(startResult.errors?._form?.[0] ?? 'Failed to start login');
				return;
			}

			// 2. Ask the browser to sign the challenge
			const login = await startAuthentication({
				optionsJSON: startResult.data as unknown as PublicKeyCredentialRequestOptionsJSON,
			});
			console.log(login);

			// 3. Give the signed challenge to the worker to finish the login process
			const finishResult = await finishPasskeyLogin(login);
			console.log(finishResult);

			if (!finishResult.success) {
				console.log('Failed');
				setResult(finishResult.errors?._form?.[0] ?? 'Login failed');
			} else {
				setResult('Login successful!');
				navigate('/profile', { history: 'replace' });
			}
		} catch (error: unknown) {
			setResult(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	const handlePerformPasskeyLogin = (): void => {
		startTransition(() => void passkeyLogin());
	};

	return (
		<div className="login-option">
			<h3>Login with Passkey</h3>
			<p>For users that have already registered a passkey.</p>
			<button type="button" onClick={handlePerformPasskeyLogin} disabled={isPending}>
				{isPending ? <>...</> : 'Login with passkey'}
			</button>
			{result && <div>{result}</div>}
		</div>
	);
}
