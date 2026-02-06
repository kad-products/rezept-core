import type { RequestInfo } from 'rwsdk/worker';
import SeasonView from '@/components/server/SeasonView';
import StandardLayout from '@/layouts/standard';

export default function Pages__seasons__view({ ctx, params }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<SeasonView listId={params.listId} />
		</StandardLayout>
	);
}
