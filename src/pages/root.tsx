import type { RequestInfo } from 'rwsdk/worker';
import RecipeSearch from '@/components/RecipeSearch';
import { monthOptions } from '@/data/months';
import AppLayout from '@/layouts/app';
import { getGrowingZones } from '@/repositories';

export default async function Pages__root({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const growingZones = await getGrowingZones(ctx.logger);
	const growingZoneOptions = growingZones.map(gz => ({ value: gz.id, label: gz.name }));
	return (
		<AppLayout currentBasePage="home" pageTitle="Home" ctx={ctx}>
			<RecipeSearch growingZoneOptions={growingZoneOptions} monthOptions={monthOptions} userPermissions={ctx.permissions} />
		</AppLayout>
	);
}
