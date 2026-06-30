import type { RequestInfo } from 'rwsdk/worker';
import { RzLink } from '@/components/design-system';
import UserPermissionsTable from '@/components/tables/UserPermissionsTable';
import AppLayout from '@/layouts/app';

export default async function Pages__profile__permissions({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	return (
		<AppLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx} leftNav="profile">
			<h2>Permissions</h2>
			{ctx.session?.permissionsOverride && <p>Override active</p>}
			<UserPermissionsTable userPermissions={ctx.permissions || []} permissionsList={ctx.permissions || []} />
			<RzLink
				permissions={ctx.permissions || []}
				requiredPermission="permissions:override"
				label="Override Permissions"
				href="/profile/permissions/override"
			/>
		</AppLayout>
	);
}
