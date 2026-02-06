import type { RequestInfo } from 'rwsdk/worker';
import ListsListing from '@/components/server/ListsListing';
import StandardLayout from '@/layouts/standard';

export default function Pages__lists__listing({ ctx }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="lists" pageTitle="Lists" ctx={ctx}>
			<ListsListing />
		</StandardLayout>
	);
}
