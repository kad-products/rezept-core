import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import StandardLayout from '@/layouts/standard';
import { getIngredientsBySeasonId } from '@/repositories/seasonal-ingredients';
import { getSeasonById } from '@/repositories/seasons';

export default async function Pages__seasons__view({ ctx, params }: RequestInfo) {
	const seasonId = params.seasonId;
	const [season, seasonalIngredients] = await Promise.all([
		seasonId ? getSeasonById(seasonId) : Promise.resolve(undefined),
		seasonId ? getIngredientsBySeasonId(seasonId) : Promise.resolve(undefined),
	]);

	if (!season) {
		return <p>Season not found</p>;
	}
	return (
		<StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<Suspense fallback={<div>Loading season...</div>}>
				<h3>{season.name}</h3>
				{ctx.permissions?.includes('seasons:update') && (
					<nav className="in-page-nav">
						<a href={`/seasons/${season.id}/edit`}>Edit</a>
					</nav>
				)}

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
					{seasonalIngredients?.map(si => (
						<li key={si.id}>{si.ingredient.name}</li>
					))}
				</ul>
			</Suspense>
		</StandardLayout>
	);
}
