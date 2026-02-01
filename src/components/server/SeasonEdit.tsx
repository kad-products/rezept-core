import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { Suspense } from 'react';
import Season from '@/forms/season';
import { getIngredients } from '@/repositories/ingredients';
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

	const ingredients = await getIngredients();

	return (
		<Suspense fallback={<div>Loading season...</div>}>
			<h3>Edit {season.name}</h3>
			<nav className="in-page-nav">
				<a href={`/seasons/${season.id}`}>View</a>
			</nav>
			<Season season={season} ingredients={ingredients} countries={countryList} />
		</Suspense>
	);
}
