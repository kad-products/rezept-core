import { Suspense } from 'react';
import { getSeasons } from '@/repositories/seasons';

import Card from '../client/Card';

export default async function SeasonsListing() {
	const seasons = await getSeasons();

	return (
		<Suspense fallback={<div>Loading seasons...</div>}>
			<div className="seasons-listing">
				{seasons.map(s => {
					return (
						<Card
							key={s.id}
							title={s.name}
							actions={[
								{
									href: `/seasons/${s.id}`,
									text: `View`,
								},
							]}
						/>
					);
				})}
			</div>
		</Suspense>
	);
}
