import { prefix, render, route } from 'rwsdk/router';
import { defineApp } from 'rwsdk/worker';

import { Document } from '@/Document';
import authMiddleware from '@/middleware/auth';
import headersMiddleware from '@/middleware/headers';
import userMiddleware from '@/middleware/user';
import authRoutes from '@/pages/auth/routes';
import profileRoutes from '@/pages/profile/routes';
import recipeRoutes from '@/pages/recipes/routes';
import seasonRoutes from '@/pages/seasons/routes';
import permissionsMiddleware from './middleware/permissions';
import Pages__root from './pages/root';

export { SessionDurableObject } from '@/session/durable-object';

export default defineApp([
	headersMiddleware,
	authMiddleware,
	userMiddleware,
	permissionsMiddleware,
	render(Document, [
		route('/', Pages__root),

		prefix('/auth', authRoutes),
		prefix('/profile', profileRoutes),
		prefix('/recipes', recipeRoutes),
		prefix('/seasons', seasonRoutes),
	]),
]);
