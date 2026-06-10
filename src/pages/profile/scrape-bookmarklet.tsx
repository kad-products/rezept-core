import type { RequestInfo } from 'rwsdk/worker';
import BookmarkletInstall from '@/components/BookmarkletInstall';
import ProfileNav from '@/components/navs/ProfileNav';
import AppLayout from '@/layouts/app';
import { getApiKeysByUserId } from '@/repositories';

export default async function Pages__profile__scrape_bookmarklet({ ctx, request }: RequestInfo): Promise<React.JSX.Element> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in route chain
	const userId = ctx.user!.id;

	const apiKeys = await getApiKeysByUserId(userId, ctx.logger);
	const baseUrl = new URL(request.url).origin;

	return (
		<AppLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx} leftNav={<ProfileNav />}>
			<h2>Bookmarklet Install</h2>
			<BookmarkletInstall apiKeys={apiKeys} userId={userId} baseUrl={baseUrl} />
		</AppLayout>
	);
}
