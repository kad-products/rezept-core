import type { RequestInfo } from 'rwsdk/worker';
import RzTable from '@/components/RzTable';
import AdminLayout from '@/layouts/admin';
import { getUsers } from '@/repositories';
import type { RzTableColumn, UserDBRead } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'username', label: 'Username' },
	{ key: 'role', label: 'Role' },
	{ key: 'createdAt', label: 'Created' },
];

export default async function Pages__admin__users({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const users = await getUsers(ctx.logger);

	return (
		<AdminLayout pageTitle="Users">
			<RzTable<UserDBRead> columns={columns} data={users} />
		</AdminLayout>
	);
}
