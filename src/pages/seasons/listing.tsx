import type { RequestInfo } from 'rwsdk/worker';
import SeasonsListing from '@/components/server/SeasonsListing';
import StandardLayout from '@/layouts/standard';

export default function Pages__seasons__listing({ ctx }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
			<SeasonsListing />
		</StandardLayout>
	);
}
