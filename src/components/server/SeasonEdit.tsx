import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { Suspense } from 'react';
import Season from '@/forms/season';
import { getIngredients } from '@/repositories/ingredients';
import { getIngredientsBySeasonId } from '@/repositories/seasonal-ingredients';
import { getSeasonById } from '@/repositories/seasons';

countries.registerLocale(en);

const countryList = Object.entries(countries.getNames('en')).map(([code, name]) => ({
	code, // "US", "NO", "NG"
	name, // "United States", "Norway", "Nigeria"
}));

export default async function SeasonEdit({ listId }: { listId: string }) {
	const season = await getSeasonById(listId);

	if (!season) {
		return null;
	}

	const [allIngredients, seasonalIngredients] = await Promise.all([
		getIngredients(),
		getIngredientsBySeasonId(season.id),
	]);

	return (
		<Suspense fallback={<div>Loading season...</div>}>
			<h3>Edit {season.name}</h3>
			<nav className="in-page-nav">
				<a href={`/seasons/${season.id}`}>View</a>
			</nav>
			<Season
				season={season}
				ingredients={allIngredients}
				countries={countryList}
				seasonalIngredients={seasonalIngredients}
			/>
		</Suspense>
	);
}
