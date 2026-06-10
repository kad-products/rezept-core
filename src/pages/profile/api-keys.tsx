import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import ProfileNav from '@/components/navs/ProfileNav';
import ApiKeysTable from '@/components/tables/ApiKeysTable';
import AppLayout from '@/layouts/app';
import { getApiKeysByUserId } from '@/repositories';

export default async function Pages__profile__api_keys({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in route chain
	const userId = ctx.user!.id;

	const apiKeys = await getApiKeysByUserId(userId, ctx.logger);
	return (
		<AppLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx} leftNav={<ProfileNav userPerms={ctx.permissions} />}>
			<h2>API Keys</h2>
			<Suspense fallback={<div>Loading API keys...</div>}>
				<ApiKeysTable apiKeys={apiKeys} />
			</Suspense>
			{ctx.permissions?.includes('api-keys:create') && <a href="/profile/api-keys/new">New API Key</a>}
		</AppLayout>
	);
}
