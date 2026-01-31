import { Suspense } from 'react';
import { getIngredientsBySeasonId } from '@/repositories/seasonal-ingredients';
import { getSeasonById } from '@/repositories/seasons';

export default async function SeasonView({ listId }: { listId: string }) {
	const season = await getSeasonById(listId);

	if (!season) {
		return null;
	}

	const ingredients = await getIngredientsBySeasonId(season.id);

	return (
		<Suspense fallback={<div>Loading season...</div>}>
			<h3>{season.name}</h3>
			<nav className="in-page-nav">
				<a href={`/seasons/${season.id}/edit`}>Edit</a>
			</nav>
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
				{ingredients.map(si => (
					<li key={si.id}>{si.ingredient.name}</li>
				))}
			</ul>
		</Suspense>
	);
}
