import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import ApiKeysTable from '@/components/ApiKeysTable';
import StandardLayout from '@/layouts/standard';
import { getApiKeysByUserId, getCredentialsByUserId } from '@/repositories';

export default async function Pages__profile__root({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const userId = ctx.user?.id;

	if (!userId) {
		return <p>No user found, please log in.</p>;
	}

	const userCredentials = await getCredentialsByUserId(userId, ctx.logger);
	const apiKeys = await getApiKeysByUserId(userId, ctx.logger);

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
