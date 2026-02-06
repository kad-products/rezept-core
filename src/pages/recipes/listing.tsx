import type { RequestInfo } from 'rwsdk/worker';
import RecipeListing from '@/components/server/RecipeListing';
import StandardLayout from '@/layouts/standard';

export default function Pages__recipes__listing({ ctx }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<RecipeListing />
		</StandardLayout>
	);
}
