import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import ApiKeysTable from '@/components/tables/ApiKeysTable';
import UserCredentialsTable from '@/components/tables/UserCredentialsTable';
import UserPermissionsTable from '@/components/tables/UserPermissionsTable';
import AppLayout from '@/layouts/app';
import { getApiKeysByUserId, getCredentialsByUserId } from '@/repositories';

export default async function Pages__profile__root({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in route chain
	const userId = ctx.user!.id;

	const credentials = await getCredentialsByUserId(userId, ctx.logger);
	const apiKeys = await getApiKeysByUserId(userId, ctx.logger);

	return (
		<AppLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx}>
			<h2>Profile Info</h2>
			<ul>
				<li>ID: {ctx.user?.id}</li>
				<li>Username: {ctx.user?.username}</li>
				<li>Roles: {ctx.user?.role}</li>
				<li>Created: {ctx.user?.createdAt}</li>
			</ul>
			<Suspense fallback={<div>Loading credentials...</div>}>
				<h2>Permissions</h2>
				{ctx.session?.permissionsOverride && <p>Override active</p>}
				<UserPermissionsTable permissionsList={ctx.permissions || []} />
				{ctx.permissions?.includes('permissions:override') && <a href="/profile/permissions/override">Override Permissions</a>}
				<h2>API Keys</h2>
				<ApiKeysTable apiKeys={apiKeys} />
				{ctx.permissions?.includes('api-keys:create') && <a href="/profile/api-keys/new">New API Key</a>}
				<h2>WebAuthn Credentials</h2>
				<UserCredentialsTable credentials={credentials} />
			</Suspense>
		</AppLayout>
	);
}
