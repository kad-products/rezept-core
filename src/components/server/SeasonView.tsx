import { Suspense } from 'react';
import { getSeasonById } from '@/repositories/seasons';

export default async function SeasonView({ listId }: { listId: string }) {
	const season = await getSeasonById(listId);

	if (!season) {
		return null;
	}

	return (
		<Suspense fallback={<div>Loading recipe...</div>}>
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
		</Suspense>
	);
}
