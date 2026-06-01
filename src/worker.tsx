import { except, prefix, render, route } from 'rwsdk/router';
import { defineApp, type RequestInfo } from 'rwsdk/worker';
import apiRoutes from '@/api/routes';
import { Document } from '@/Document';
import headersMiddleware from '@/middleware/headers';
import sessionMiddleware from '@/middleware/session';
import userMiddleware from '@/middleware/user';
import authRoutes from '@/pages/auth/routes';
import profileRoutes from '@/pages/profile/routes';
import recipeRoutes from '@/pages/recipes/routes';
import seasonRoutes from '@/pages/seasons/routes';
import apiKeyMiddleware from './middleware/api-key';
import botMiddleware from './middleware/bot';
import corsMiddleware from './middleware/cors';
import loggerMiddleware from './middleware/logger';
import permissionsMiddleware from './middleware/permissions';
import Pages__root from './pages/root';
import testBridgeRoutes from './test-bridge';
import { handlePageError } from './worker-error';

export { SessionDurableObject } from '@/durable-objects';

export default defineApp([
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
	render(Document, [
		except<RequestInfo>(handlePageError),
		route('/', Pages__root),
		prefix('/auth', authRoutes),
		prefix('/profile', profileRoutes),
		prefix('/recipes', recipeRoutes),
		prefix('/seasons', seasonRoutes),
	]),
]);
