import type { RequestInfo } from 'rwsdk/worker';
import seasons from '@/data/seasons';
import StandardLayout from '@/layouts/standard';

export default function Season({ params, ctx }: RequestInfo) {
	const season = seasons.find(s => s.id === params.id);

	if (!season) {
		return (
			<StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
				<p>The season you are looking for does not exist.</p>
			</StandardLayout>
		);
	}

	return (
		<StandardLayout currentBasePage="seasons" pageTitle={`Season: ${season.name}`} ctx={ctx}>
			<a href="/seasons">← All Seasons</a>
			<p>
				<span>Location: {season.location}</span>
			</p>
			<p>
				<span>Months: {season.months.join(', ')}</span>
			</p>
			<p>
				<span>ID: {season.id}</span>
			</p>
			<h3>Ingredients:</h3>
			<ul>
				{season.ingredients.map(ingredient => (
					<li key={ingredient.id}>{ingredient.name}</li>
				))}
			</ul>
		</StandardLayout>
	);
}
