import type { RequestInfo } from 'rwsdk/worker';
import { RzTable } from '@/components/design-system';
import AdminLayout from '@/layouts/admin';
import { getUsers } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'username', label: 'Username' },
	{ key: 'role', label: 'Role' },
	{ key: 'createdAt', label: 'Created' },
	{ key: 'editUrl', label: '', action: { type: 'link', hrefProp: 'editUrl', label: 'Edit' } },
];

export default async function Pages__admin__users({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const users = await getUsers(ctx.logger);
	const rows = users.map(u => ({ ...u, editUrl: `/admin/users/${u.id}/edit` }));

	return (
		<AdminLayout pageTitle="Users">
			<RzTable columns={columns} data={rows} />
		</AdminLayout>
	);
}
