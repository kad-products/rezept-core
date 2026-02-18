import { Suspense } from 'react';
import { countryOptions } from '@/data/countries';
import { monthOptions } from '@/data/months';
import Season from '@/forms/season';
import { getIngredients } from '@/repositories/ingredients';
import { getIngredientsBySeasonId } from '@/repositories/seasonal-ingredients';
import { getSeasonById } from '@/repositories/seasons';

export default async function SeasonEdit({ listId }: { listId: string }) {
	const season = await getSeasonById(listId);

	if (!season) {
		return null;
	}

	const [allIngredients, seasonalIngredients] = await Promise.all([getIngredients(), getIngredientsBySeasonId(season.id)]);

	return (
		<Suspense fallback={<div>Loading season...</div>}>
			<h3>Edit {season.name}</h3>
			<nav className="in-page-nav">
				<a href={`/seasons/${season.id}`}>View</a>
			</nav>
			<Season
				season={season}
				ingredients={allIngredients}
				countryOptions={countryOptions}
				monthOptions={monthOptions}
				seasonalIngredients={seasonalIngredients}
			/>
		</Suspense>
	);
}
