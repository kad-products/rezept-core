import { except, prefix, render, route } from 'rwsdk/router';
import { type DefaultAppContext, defineApp, type RequestInfo } from 'rwsdk/worker';
import apiRoutes from '@/api/routes';
import AdminDocument from '@/documents/admin';
import AppDocument from '@/documents/app';
import NoJSDocument from '@/documents/no-js';
import apiKeyMiddleware from '@/middleware/api-key';
import botMiddleware from '@/middleware/bot';
import corsMiddleware from '@/middleware/cors';
import headersMiddleware from '@/middleware/headers';
import loggerMiddleware from '@/middleware/logger';
import permissionsMiddleware from '@/middleware/permissions';
import sessionMiddleware from '@/middleware/session';
import userMiddleware from '@/middleware/user';
import adminRoutes from '@/pages/admin/routes';
import authRoutes from '@/pages/auth/routes';
import NotFound from '@/pages/not-found';
import profileRoutes from '@/pages/profile/routes';
import recipeRoutes from '@/pages/recipes/routes';
import Pages__root from '@/pages/root';
import seasonRoutes from '@/pages/seasons/routes';
import testBridgeRoutes from '@/test-bridge';
import { handlePageError } from '@/worker-error';

export { SessionDurableObject } from '@/durable-objects';
export { RecipeScrapeCoverImageRetryWorkflow } from '@/workflows';

export default defineApp(
	[
		botMiddleware,
		loggerMiddleware,
		headersMiddleware,
		corsMiddleware,
		sessionMiddleware,
		apiKeyMiddleware,
		userMiddleware,
		permissionsMiddleware,
		...testBridgeRoutes,
		prefix('/api', apiRoutes),
		render(AdminDocument, [prefix('/admin', adminRoutes.admin)]),
		render(NoJSDocument, [prefix('/recipes', recipeRoutes.noJS)]),
		render(AppDocument, [
			except<RequestInfo<DefaultAppContext>>(handlePageError),
			route('/', Pages__root),
			prefix('/auth', authRoutes.app),
			prefix('/profile', profileRoutes.app),
			prefix('/recipes', recipeRoutes.app),
			prefix('/seasons', seasonRoutes.app),
			route('*', NotFound),
		]),
	],
	{
		// Allow the tunnel origin in dev so rwsdk's same-origin check passes when
		// req.url is localhost but the browser Origin header is the tunnel hostname.
		allowedOrigins: import.meta.env.VITE_BASE_URL ? [import.meta.env.VITE_BASE_URL] : undefined,
	},
);
