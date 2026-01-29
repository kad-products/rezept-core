import type { RequestInfo } from 'rwsdk/worker';
import ListEdit from '@/components/server/ListEdit';
import StandardLayout from '@/layouts/standard';

export default function Pages__lists__edit({ ctx, params }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="lists" pageTitle="Lists" ctx={ctx}>
			<ListEdit listId={params.listId} />
		</StandardLayout>
	);
}
