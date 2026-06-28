import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { RzCard, RzLink } from '@/components/design-system';
import AppLayout from '@/layouts/app';
import { getSeasons } from '@/repositories';

export default async function Pages__seasons__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const seasons = await getSeasons(ctx.logger);
	return (
		<AppLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<Suspense fallback={<div>Loading seasons...</div>}>
				<RzLink permissions={ctx.permissions} requiredPermission="seasons:create" label="New Season" href="/seasons/new" />
				<div className="seasons-listing">
					{seasons.map(s => {
						return (
							<RzCard
								key={s.id}
								title={s.name}
								actions={[
									{
										href: `/seasons/${s.id}`,
										label: `View`,
									},
								]}
							/>
						);
					})}
				</div>
			</Suspense>
		</AppLayout>
	);
}
