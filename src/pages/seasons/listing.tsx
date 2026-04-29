import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import RzCard from '@/components/RzCard';
import StandardLayout from '@/layouts/standard';
import { getSeasons } from '@/repositories/seasons';

export default async function Pages__seasons__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const seasons = await getSeasons();
	return (
		<StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<Suspense fallback={<div>Loading seasons...</div>}>
				{ctx.permissions?.includes('seasons:create') && <a href="/seasons/new">New Season</a>}
				<div className="seasons-listing">
					{seasons.map(s => {
						return (
							<RzCard
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
		</StandardLayout>
	);
}
