import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import ApiKeyForm from '@/forms/api-key';
import AppLayout from '@/layouts/app';
import { getApiKeyById } from '@/repositories';
import type { ApiKeyDBRead } from '@/types';

export default async function Pages__profile__edit_api_key({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
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
		<AppLayout currentBasePage="profile" pageTitle="API Key" ctx={ctx} leftNav="profile">
			<Suspense fallback={<div>Loading API Key...</div>}>
				<h3>{apiKey?.id ? `Edit ${apiKey.name}` : 'New API Key'}</h3>
				{apiKey?.id && (
					<RzPopMenu
						userPermissions={ctx.permissions}
						items={[
							{
								requiredPermission: 'api-keys:read',
								label: 'View',
								href: `/api-keys/${apiKey?.id}`,
							},
						]}
					/>
				)}
				<ApiKeyForm apiKey={apiKey} currentUserId={userId} />
			</Suspense>
		</AppLayout>
	);
}
