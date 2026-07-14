import type { RequestInfo } from 'rwsdk/worker';
import { RzLink, RzTable } from '@/components/design-system';
import AdminLayout from '@/layouts/admin';
import { getGrowingZones } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'code', label: 'Code' },
	{ key: 'name', label: 'Name' },
	{ key: 'createdAt', label: 'Created' },
	{
		key: 'actions',
		label: '',
		actions: [{ type: 'link', hrefProp: 'editUrl', label: 'Edit', requiredPermission: 'growing-zones:update' }],
	},
];

export default async function Pages__admin__growing_zones__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const growingZones = await getGrowingZones(ctx.logger);
	const rows = growingZones.map(gz => ({
		...gz,
		editUrl: `/admin/growing-zones/${gz.id}/edit`,
	}));

	return (
		<AdminLayout ctx={ctx} currentBasePage="growing-zones" pageTitle="Growing Zones">
			<RzLink
				userPermissions={ctx.permissions}
				requiredPermission="growing-zones:create"
				label="New Growing Zone"
				href="/admin/growing-zones/new"
			/>
			<RzTable userPermissions={ctx.permissions} columns={columns} data={rows} />
		</AdminLayout>
	);
}
