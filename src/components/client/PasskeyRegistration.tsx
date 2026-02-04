'use client';

import { startRegistration } from '@simplewebauthn/browser';
import { useState, useTransition } from 'react';
import { finishPasskeyRegistration, startPasskeyRegistration } from '@/functions/auth';

export default function PasskeyRegistration() {
	const [username, setUsername] = useState('');
	const [result, setResult] = useState('');
	const [isPending, startTransition] = useTransition();

	const passkeyRegister = async () => {
		if (!username.trim()) {
			setResult('Please enter a username');
			return;
		}

		try {
			// 1. Get a challenge from the worker
			const options = await startPasskeyRegistration(username);
			// 2. Ask the browser to sign the challenge
			const registration = await startRegistration({ optionsJSON: options });

			// 3. Give the signed challenge to the worker to finish the registration process
			const success = await finishPasskeyRegistration(username, registration);

			if (!success) {
				setResult('Registration failed');
			} else {
				setResult('Registration successful!');
			}
		} catch (error: unknown) {
			setResult(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	const handlePerformPasskeyRegister = () => {
		startTransition(() => void passkeyRegister());
	};

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newUsername = e.currentTarget.value;
		setUsername(newUsername);
	};

	return (
		<div className="login-option">
			<h3>Passkey Registration</h3>
			<p>Enter a username and click the register button to start the passkey registration process.</p>
			<input type="text" value={username} onChange={handleUsernameChange} placeholder="Username" />
			<button type="button" onClick={handlePerformPasskeyRegister} disabled={isPending}>
				{isPending ? <>...</> : 'Register with passkey'}
			</button>
			{result && <div>{result}</div>}
		</div>
	);
}
