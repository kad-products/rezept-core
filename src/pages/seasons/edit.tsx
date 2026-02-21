import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { countryOptions } from '@/data/countries';
import { monthOptions } from '@/data/months';
import Season from '@/forms/season';
import StandardLayout from '@/layouts/standard';
import { getIngredients } from '@/repositories/ingredients';
import { getIngredientsBySeasonId } from '@/repositories/seasonal-ingredients';
import { getSeasonById } from '@/repositories/seasons';
import type { Season as SeasonModel } from '@/types';

export default async function Pages__seasons__edit({ ctx, params }: RequestInfo) {
	const seasonId = params.seasonId;
	let [allIngredients, season, seasonalIngredients] = await Promise.all([
		getIngredients(),
		seasonId ? getSeasonById(seasonId) : Promise.resolve(undefined),
		seasonId ? getIngredientsBySeasonId(seasonId) : Promise.resolve(undefined),
	]);

	if (!seasonId) {
		season = {} as SeasonModel;
	} else if (!season) {
		return null;
	}

	const ingredientOptions = allIngredients.map(i => ({
		value: i.id,
		label: i.name,
	}));

	return (
		<StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<Suspense fallback={<div>Loading season...</div>}>
				<h3>{seasonId ? `Edit ${season.name}` : 'New Season'}</h3>
				<nav className="in-page-nav">
					<a href={`/seasons/${season.id}`}>View</a>
				</nav>
				<Season
					season={season}
					ingredientOptions={ingredientOptions}
					countryOptions={countryOptions}
					monthOptions={monthOptions}
					seasonalIngredients={seasonalIngredients}
				/>
			</Suspense>
		</StandardLayout>
	);
}
