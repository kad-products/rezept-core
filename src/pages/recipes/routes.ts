import { route } from 'rwsdk/router';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import Pages__recipes__edit from './edit';
import Pages__recipes__listing from './listing';
import Pages__recipes__print from './print';
import Pages__recipes__scrapes__listing from './scrapes/listing';
import Pages__recipes__uploads__new from './uploads/form';
import Pages__recipes__uploads__listing from './uploads/listing';
import Pages__recipes__uploadView from './uploads/view';
import Pages__recipes__view from './view';

const appRoutes = [
	route('/', [requirePermissions('recipes:read'), Pages__recipes__listing]),
	route('/scrapes', [requireAuthentication, requirePermissions('recipes:scrape'), Pages__recipes__scrapes__listing]),
	route('/uploads', [requireAuthentication, requirePermissions('recipes:upload'), Pages__recipes__uploads__listing]),
	route('/uploads/new', [requireAuthentication, requirePermissions('recipes:upload'), Pages__recipes__uploads__new]),
	route('/new', [requireAuthentication, requirePermissions('recipes:create'), Pages__recipes__edit]),
	route('/:recipeId', [requirePermissions('recipes:read'), Pages__recipes__view]),
	route('/:recipeId/edit', [requireAuthentication, requirePermissions('recipes:update'), Pages__recipes__edit]),
	route('/uploads/:recipeUploadId', [requireAuthentication, requirePermissions('recipes:upload'), Pages__recipes__uploadView]),
];

const noJsRoutes = [route('/:recipeId/print', [requirePermissions('recipes:read'), Pages__recipes__print])];

export default {
	app: appRoutes,
	noJS: noJsRoutes,
};
