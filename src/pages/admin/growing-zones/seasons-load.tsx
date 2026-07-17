import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import GrowingZoneSeasonLoadForm from '@/forms/growing-zone-seasons-load';
import AdminLayout from '@/layouts/admin';
import { getGrowingZoneById } from '@/repositories';

export default async function Pages__admin__growing_zones__seasons_load({
	ctx,
	params,
}: RequestInfo): Promise<React.JSX.Element> {
	const growingZoneId = params.growingZoneId;
	if (!growingZoneId) {
		return <p>Growing Zone required</p>;
	}
	const growingZone = await getGrowingZoneById(growingZoneId, ctx.logger);

	return (
		<AdminLayout ctx={ctx} currentBasePage="growing-zones" pageTitle={`Load Seasons for ${growingZone.name}`}>
			<RzPopMenu
				userPermissions={ctx.permissions}
				items={[
					{
						requiredPermission: 'growing-zones:read',
						label: 'Listing',
						href: `/admin/growing-zones`,
					},
					{
						requiredPermission: 'ingredients:create',
						label: 'Seasons',
						href: `/admin/growing-zones/${growingZone.id}/seasons`,
					},
				]}
			/>
			<p>Load some ingredients y'all</p>
			<GrowingZoneSeasonLoadForm growingZoneId={growingZoneId} />
		</AdminLayout>
	);
}
