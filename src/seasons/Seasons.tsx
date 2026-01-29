import type { RequestInfo } from 'rwsdk/worker';
import seasons from '@/data/seasons';
import StandardLayout from '@/layouts/standard';

export default function Seasons({ ctx }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			{seasons.map(season => (
				<section key={season.name}>
					<h3>{season.name}</h3>
					<p>Location: {season.location}</p>
					<p>Months: {season.months.join(', ')}</p>
					<p>
						<a href={`/seasons/${season.id}`}>View Details</a>
					</p>
				</section>
			))}
		</StandardLayout>
	);
}
