import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import ApiKeysTable from '@/components/api-keys-table';
import StandardLayout from '@/layouts/standard';
import { getApiKeysByUserId } from '@/repositories/api-keys';
import { getCredentialsByUserId } from '@/repositories/credentials';

export default async function Pages__profile__root({ ctx }: RequestInfo) {
	const userId = ctx.user?.id;

	if (!userId) {
		return <p>No user found, please log in.</p>;
	}

	const userCredentials = await getCredentialsByUserId(userId);
	const apiKeys = await getApiKeysByUserId(userId);

	// Only plain objects can be passed to Client Components from Server Components. Uint8Array objects are not supported.
	const clientComponentCredentials = userCredentials.map(credential => ({
		...credential,
		credentialId: undefined,
		publicKey: undefined,
	}));

	return (
		<StandardLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx}>
			<div>
				<pre>{JSON.stringify(ctx, null, 2)}</pre>
			</div>
			<Suspense fallback={<div>Loading credentials...</div>}>
				<ApiKeysTable apiKeys={apiKeys} />
				{ctx.permissions?.includes('apiKeys:create') && <a href="/profile/api-keys/new">New API Key</a>}
				<div>
					<pre>{JSON.stringify({ clientComponentCredentials }, null, 2)}</pre>
				</div>
			</Suspense>
		</StandardLayout>
	);
}
