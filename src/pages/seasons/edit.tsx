import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import { countryOptions } from '@/data/countries';
import { monthOptions } from '@/data/months';
import SeasonForm from '@/forms/season';
import AppLayout from '@/layouts/app';
import { getIngredients, getSeasonById } from '@/repositories';
import type { SeasonWithIngredients } from '@/types';

export default async function Pages__seasons__edit({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const seasonId = params.seasonId;
	let [allIngredients, season] = await Promise.all([
		getIngredients(ctx.logger),
		seasonId ? getSeasonById(seasonId, ctx.logger) : Promise.resolve(undefined),
	]);

	if (!seasonId) {
		season = {} as SeasonWithIngredients;
	} else if (!season) {
		return <p>Season not found</p>;
	}

	const ingredientOptions = allIngredients.map(i => ({
		value: i.id,
		label: i.name,
	}));

	return (
		<AppLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<Suspense fallback={<div>Loading season...</div>}>
				<h3>{seasonId ? `Edit ${season.name}` : 'New Season'}</h3>
				{seasonId && (
					<RzPopMenu
						permissions={ctx.permissions}
						items={[
							{
								requiredPermission: 'seasons:read',
								label: 'View',
								href: `/seasons/${seasonId}`,
							},
						]}
					/>
				)}
				<SeasonForm
					season={season}
					ingredientOptions={ingredientOptions}
					countryOptions={countryOptions}
					monthOptions={monthOptions}
					seasonalIngredients={season.seasonalIngredients}
				/>
			</Suspense>
		</AppLayout>
	);
}
