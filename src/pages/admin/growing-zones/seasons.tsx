import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu, RzTable } from '@/components/design-system';
import AdminLayout from '@/layouts/admin';
import { getGrowingZoneById } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'ingredient', label: 'Ingredient' },
	{ key: 'startMonth', label: 'Start Month' },
	{ key: 'endMonth', label: 'End Month' },
	{ key: 'lastVerifiedAt', label: 'Last Verified' },
	{ key: 'notes', label: 'Notes' },
];

export default async function Pages__admin__growing_zones__seasons({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const growingZoneId = params.growingZoneId;
	if (!growingZoneId) {
		return <p>Growing Zone required</p>;
	}
	const growingZone = await getGrowingZoneById(growingZoneId, ctx.logger);
	const seasons = growingZone.seasons.map(s => {
		const ingredient = s.ingredient.name;
		return {
			...s,
			ingredient,
		};
	});
	return (
		<AdminLayout ctx={ctx} currentBasePage="growing-zones" pageTitle={`Ingredient Seasons for ${growingZone.name}`}>
			<RzPopMenu
				userPermissions={ctx.permissions}
				items={[
					{
						requiredPermission: 'growing-zones:read',
						label: 'Listing',
						href: `/admin/growing-zones`,
					},
					{
						requiredPermission: 'ingredient-seasons:load',
						label: 'Load Ingredient Seasons',
						href: `/admin/growing-zones/${growingZoneId}/seasons-load`,
					},
				]}
			/>
			<RzTable userPermissions={ctx.permissions} columns={columns} data={seasons} />
		</AdminLayout>
	);
}
