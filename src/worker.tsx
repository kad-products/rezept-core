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
import RootErrorHandler from './components/RootErrorHandler';
import apiKeyMiddleware from './middleware/api-key';
import botMiddleware from './middleware/bot';
import corsMiddleware from './middleware/cors';
import loggerMiddleware from './middleware/logger';
import permissionsMiddleware from './middleware/permissions';
import Pages__root from './pages/root';

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
	render(Document, [
		// API routes first. The prefix carries its own except handler (see src/api/routes.ts)
		// which catches API errors and returns JSON. Because rwsdk's except handler search walks
		// backwards through the flat compiled array with no path filtering, the API except must
		// sit at a higher compiled index than the page-level except below — otherwise the page
		// handler would catch API errors first.
		prefix('/api', apiRoutes),
		// Page-level error boundary. Sits between the API prefix and all page routes so that
		// page-route errors reach this handler before the API's except handler above.
		except<RequestInfo>(error => <RootErrorHandler error={error as Error} />),
		route('/', Pages__root),
		prefix('/auth', authRoutes),
		prefix('/profile', profileRoutes),
		prefix('/recipes', recipeRoutes),
		prefix('/seasons', seasonRoutes),
	]),
]);
