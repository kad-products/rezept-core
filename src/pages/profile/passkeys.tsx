import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import UserCredentialsTable from '@/components/tables/UserCredentialsTable';
import AppLayout from '@/layouts/app';
import { getCredentialsByUserId } from '@/repositories';

export default async function Pages__profile__passkeys({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in route chain
	const userId = ctx.user!.id;

	const credentials = await getCredentialsByUserId(userId, ctx.logger);
	return (
		<AppLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx} leftNav="profile">
			<h2>Passkeys / WebAuthn Credentials</h2>
			<Suspense fallback={<div>Loading credentials...</div>}>
				<UserCredentialsTable userPermissions={ctx.permissions || []} credentials={credentials} />
			</Suspense>
		</AppLayout>
	);
}
