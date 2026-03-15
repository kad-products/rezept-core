import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { requestInfo } from 'rwsdk/worker';
import FormApiKey from '@/forms/api-key';
import StandardLayout from '@/layouts/standard';
import { getApiKeyById } from '@/repositories/api-keys';
import type { ApiKey } from '@/types';

export default async function Pages__api_keys__edit({ ctx, params }: RequestInfo) {
	const apiKeyId = params.apiKeyId;
	const userId = requestInfo.ctx.user?.id;

	let apiKey: ApiKey | undefined;

	if (!apiKeyId) {
		apiKey = undefined;
	} else {
		apiKey = await getApiKeyById(params.apiKeyId);
	}

	return (
		<StandardLayout currentBasePage="profile" pageTitle="API Key" ctx={ctx}>
			<Suspense fallback={<div>Loading API Key...</div>}>
				<h3>{apiKey?.id ? `Edit ${apiKey.name}` : 'New API Key'}</h3>
				{apiKey && (
					<nav className="in-page-nav">
						<a href={`/api-keys/${apiKey.id}`}>View</a>
					</nav>
				)}
				<FormApiKey apiKey={apiKey} currentUserId={userId} />
			</Suspense>
		</StandardLayout>
	);
}
