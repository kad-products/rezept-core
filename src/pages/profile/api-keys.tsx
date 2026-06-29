import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { RzLink } from '@/components/design-system';
import ApiKeysTable from '@/components/tables/ApiKeysTable';
import AppLayout from '@/layouts/app';
import { getApiKeysByUserId } from '@/repositories';

export default async function Pages__profile__api_keys({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in route chain
	const userId = ctx.user!.id;

	const apiKeys = await getApiKeysByUserId(userId, ctx.logger);
	return (
		<AppLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx} leftNav="profile">
			<h2>API Keys</h2>
			<Suspense fallback={<div>Loading API keys...</div>}>
				<ApiKeysTable apiKeys={apiKeys} />
			</Suspense>
			<RzLink
				permissions={ctx.permissions}
				requiredPermission="api-keys:create"
				label="New API Key"
				href="/profile/api-keys/new"
			/>
		</AppLayout>
	);
}
