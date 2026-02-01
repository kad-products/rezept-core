import type { RequestInfo } from 'rwsdk/worker';
import SeasonEdit from '@/components/server/SeasonEdit';
import StandardLayout from '@/layouts/standard';

export default function Pages__seasons__edit({ ctx, params }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<SeasonEdit listId={params.listId} />
		</StandardLayout>
	);
}
