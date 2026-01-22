"use client";

import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useState, useTransition } from "react";
import {
  finishPasskeyLogin,
  finishPasskeyRegistration,
  startPasskeyLogin,
  startPasskeyRegistration,
} from "../functions";

import StandardLayout from '@/layouts/standard';

export function Login({ ctx }: { ctx: any }) {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState("");
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
        console.log( 'Failed')
        setResult("Login failed");
      } else {
        setResult("Login successful!");
      }
    } catch (error: unknown) {
      setResult(
        `Login error: ${error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  const passkeyRegister = async () => {
    if (!username.trim()) {
      setResult("Please enter a username");
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
        setResult("Registration failed");
      } else {
        setResult("Registration successful!");
      }
    } catch (error: unknown) {
      setResult(
        `Registration error: ${error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  const handlePerformPasskeyLogin = () => {
    startTransition(() => void passkeyLogin());
  };

  const handlePerformPasskeyRegister = () => {
    startTransition(() => void passkeyRegister());
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.currentTarget.value;
    setUsername(newUsername);
  };

  return (
    <StandardLayout currentBasePage="auth" ctx={ctx}>
      {
        ctx.user ?
          <div>
            <div>
              <h2>User</h2>
              <pre>{JSON.stringify(ctx.user, null, 4)}</pre>
            </div>
            <div>
              <h2>Session</h2>
              <pre>{JSON.stringify(ctx.session, null, 4)}</pre>
            </div>
          </div> :
          <>
            <h2 className="page-title">
              Login
            </h2>
            <button onClick={handlePerformPasskeyLogin} disabled={isPending}>
              {isPending ? <>...</> : "Login with passkey"}
            </button>
            <h2 className="page-title">
              Register
            </h2>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Username"
            />
            <button onClick={handlePerformPasskeyRegister} disabled={isPending}>
              {isPending ? <>...</> : "Register with passkey"}
            </button>
            {result && <div>{result}</div>}
            <div>
              <pre>{JSON.stringify(ctx, null, 4)}</pre>
            </div>
          </>
      }

    </StandardLayout>
  );
}
