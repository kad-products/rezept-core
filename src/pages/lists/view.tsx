import type { RequestInfo } from 'rwsdk/worker';
import ListView from '@/components/server/ListView';
import StandardLayout from '@/layouts/standard';

export default function Pages__lists__view({ ctx, params }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="lists" pageTitle="Lists" ctx={ctx}>
			<ListView listId={params.listId} />
		</StandardLayout>
	);
}
