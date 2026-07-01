import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import AppLayout from '@/layouts/app';
import { getSeasonById } from '@/repositories';

export default async function Pages__seasons__view({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const seasonId = params.seasonId;
	const season = await getSeasonById(seasonId, ctx.logger);
	return (
		<AppLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<Suspense fallback={<div>Loading season...</div>}>
				<h3>{season.name}</h3>
				<RzPopMenu
					userPermissions={ctx.permissions}
					items={[
						{
							requiredPermission: 'seasons:update',
							label: 'Edit',
							href: `/seasons/${season.id}/edit`,
						},
					]}
				/>
				<p>{season.description}</p>
				<ul>
					<li>Country: {season.country}</li>
					<li>Region: {season.region}</li>
					<li>Start Month: {season.startMonth}</li>
					<li>End Month: {season.endMonth}</li>
				</ul>
				<p>{season.notes}</p>
				<h4>Seasonal Ingredients</h4>
				<ul>
					{season.seasonalIngredients.map(si => (
						<li key={si.id}>{si.ingredient.name}</li>
					))}
				</ul>
			</Suspense>
		</AppLayout>
	);
}
