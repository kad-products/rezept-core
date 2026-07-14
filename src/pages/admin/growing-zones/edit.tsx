import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import GrowingZoneForm from '@/forms/growing-zone';
import AdminLayout from '@/layouts/admin';
import { getGrowingZoneById } from '@/repositories';
import type { GrowingZonesFormInput } from '@/types';

export default async function Pages__admin__growing_zones__edit({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const growingZoneId = params.growingZoneId;
	const growingZone: GrowingZonesFormInput = growingZoneId
		? await getGrowingZoneById(growingZoneId, ctx.logger)
		: { code: '', name: '' };

	const pageTitle = growingZoneId ? `Edit ${growingZone.name}` : 'New Growing Zone';

	return (
		<AdminLayout ctx={ctx} currentBasePage="growing-zones" pageTitle={pageTitle}>
			<RzPopMenu
				userPermissions={ctx.permissions}
				items={[
					{
						requiredPermission: 'growing-zones:read',
						label: 'Listing',
						href: `/admin/growing-zones`,
					},
				]}
			/>
			<GrowingZoneForm growingZone={growingZone} />
		</AdminLayout>
	);
}
