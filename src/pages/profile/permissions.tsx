import type { RequestInfo } from 'rwsdk/worker';
import UserPermissionsTable from '@/components/tables/UserPermissionsTable';
import AppLayout from '@/layouts/app';

export default async function Pages__profile__permissions({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	return (
		<AppLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx} leftNav="profile">
			<h2>Permissions</h2>
			{ctx.session?.permissionsOverride && <p>Override active</p>}
			<UserPermissionsTable permissionsList={ctx.permissions || []} />
			{ctx.permissions?.includes('permissions:override') && <a href="/profile/permissions/override">Override Permissions</a>}
		</AppLayout>
	);
}
