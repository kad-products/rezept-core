import type { RequestInfo } from 'rwsdk/worker';
import PermissionsOverrideForm from '@/forms/permissions-override';
import AppLayout from '@/layouts/app';

export default async function Pages__permissions__override({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	let permissionOverrideEnabled = false;
	if (ctx.session?.permissionsOverride) {
		permissionOverrideEnabled = true;
	}

	return (
		<AppLayout currentBasePage="profile" pageTitle="Override Permissions" ctx={ctx} leftNav="profile">
			<h2>Current Permissions</h2>
			{permissionOverrideEnabled ? <p>Permissions override enabled</p> : <p>No permissions override</p>}
			<PermissionsOverrideForm currentPermissions={ctx.permissions || []} />
		</AppLayout>
	);
}
