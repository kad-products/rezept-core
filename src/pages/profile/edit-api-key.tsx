import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import FormApiKey from '@/forms/api-key';
import StandardLayout from '@/layouts/standard';
import { getApiKeyById } from '@/repositories';
import type { ApiKeyDBRead } from '@/types';

export default async function Pages__api_keys__edit({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const apiKeyId = params.apiKeyId;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in route chain
	const userId = ctx.user!.id;

	let apiKey: ApiKeyDBRead | undefined;

	if (!apiKeyId) {
		apiKey = undefined;
	} else {
		apiKey = await getApiKeyById(params.apiKeyId, ctx.logger);
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
