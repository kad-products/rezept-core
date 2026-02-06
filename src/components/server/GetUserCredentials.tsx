import { Suspense } from 'react';
import UserCredentialsTable from '@/components/client/UserCredentialsTable';
import { getCredentialsByUserId } from '@/repositories/credentials';

export default async function GetUserCredentials({ userId }: { userId: string | undefined }) {
	if (!userId) {
		return null;
	}

	const userCredentials = await getCredentialsByUserId(userId);

	// Only plain objects can be passed to Client Components from Server Components. Uint8Array objects are not supported.
	const clientComponentCredentials = userCredentials.map(credential => ({
		...credential,
		credentialId: undefined,
		publicKey: undefined,
	}));

	return (
		<Suspense fallback={<div>Loading credentials...</div>}>
			<UserCredentialsTable credentials={clientComponentCredentials} />
		</Suspense>
	);
}
