'use client';
import { startAuthentication } from '@simplewebauthn/browser';
import { useState, useTransition } from 'react';
import { navigate } from 'rwsdk/client';
import { finishPasskeyLogin, startPasskeyLogin } from '@/functions/auth';

export default function PasskeyLogin() {
	const [result, setResult] = useState('');
	const [isPending, startTransition] = useTransition();

	const passkeyLogin = async () => {
		try {
			// 1. Get a challenge from the worker
			const options = await startPasskeyLogin();
			console.log(options);

			// 2. Ask the browser to sign the challenge
			const login = await startAuthentication({ optionsJSON: options });
			console.log(login);

			// 3. Give the signed challenge to the worker to finish the login process
			const success = await finishPasskeyLogin(login);
			console.log(success);

			if (!success) {
				console.log('Failed');
				setResult('Login failed');
			} else {
				setResult('Login successful!');
				navigate('/profile', { history: 'replace' });
			}
		} catch (error: unknown) {
			setResult(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	const handlePerformPasskeyLogin = () => {
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
