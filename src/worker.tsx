import { except, prefix, render, route } from 'rwsdk/router';
import { defineApp } from 'rwsdk/worker';
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

export { SessionDurableObject } from '@/durable-objects/durable-object';

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
		route('/', Pages__root),
		except(error => <RootErrorHandler error={error as Error} />),
		prefix('/api', apiRoutes),
		prefix('/auth', authRoutes),
		prefix('/profile', profileRoutes),
		prefix('/recipes', recipeRoutes),
		prefix('/seasons', seasonRoutes),
	]),
]);
