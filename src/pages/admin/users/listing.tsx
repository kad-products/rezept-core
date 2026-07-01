import type { RequestInfo } from 'rwsdk/worker';
import { RzTable } from '@/components/design-system';
import AdminLayout from '@/layouts/admin';
import { getUsers } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'username', label: 'Username' },
	{ key: 'role', label: 'Role' },
	{ key: 'createdAt', label: 'Created' },
	{
		key: 'actions',
		label: '',
		actions: [{ type: 'link', hrefProp: 'editUrl', label: 'Edit', requiredPermission: 'users:update' }],
	},
];

export default async function Pages__admin__users__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const users = await getUsers(ctx.logger);
	const rows = users.map(u => ({ ...u, editUrl: `/admin/users/${u.id}/edit` }));

	return (
		<AdminLayout ctx={ctx} currentBasePage="users" pageTitle="Users">
			<RzTable userPermissions={ctx.permissions} columns={columns} data={rows} />
		</AdminLayout>
	);
}
