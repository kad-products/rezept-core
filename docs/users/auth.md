# Account & Login

Rezept uses **passkeys** instead of passwords. Passkeys are built into your device — your phone, computer, or browser — and use the same biometric or PIN unlock you already use (Face ID, Touch ID, Windows Hello, etc.). You never create or remember a password.

## Creating an account

1. Go to the login page and find the **Passkey Registration** section.
2. Enter a username.
3. Click **Register with passkey**.
4. Your device will prompt you to confirm with biometrics or your PIN — follow the prompt.
5. That's it. Your account is created and your passkey is saved to this device.

**Your username** is just a label to identify your account — it doesn't need to be an email address.

## Signing in

1. Go to the login page and click **Login with passkey**.
2. Your device will prompt you to confirm — follow the prompt.
3. You're in.

You don't need to type your username when logging in. The passkey is already stored on the device and the app recognizes it automatically.

## Staying signed in

Once you sign in you stay signed in for up to **14 days**. As long as you use the app at least once every 14 days your session stays active. If you haven't used the app in 14 days you'll be asked to sign in again.

## Signing out

Use the **Logout** option in the app to end your session immediately on this device.

## Using multiple devices

Passkeys are tied to the device or browser where you registered. If you want to use Rezept on another device you'll need to register again from that device — each device gets its own passkey.

If your device supports a password manager or cloud keychain (iCloud Keychain, Google Password Manager, etc.) your passkey may sync automatically across devices. This depends on your device settings, not the app.

## Requesting a role upgrade

New accounts start with a **Basic** role, which lets you create and manage recipes. Some features — like managing seasons — require an **Admin** role.

To request an upgrade, create an [issue in Rezept](https://github.com/kad-products/rezept-core/issues) (use the blank issue option) and include your username so he can find your account.

---

## If you lose access to your device

If you lose the device you registered with and don't have access to a synced keychain, you won't be able to log in without registering a new passkey from a different device. Account recovery options are not yet available — this is a known limitation.
