import { route } from 'rwsdk/router';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import Pages__seasons__edit from './edit';
import Pages__seasons__listing from './listing';
import Pages__seasons__view from './view';

export default {
	app: [
		route('/', [requirePermissions('seasons:read'), Pages__seasons__listing]),
		route('/new', [requireAuthentication, requirePermissions('seasons:create'), Pages__seasons__edit]),
		route('/:seasonId', [requirePermissions('seasons:read'), Pages__seasons__view]),
		route('/:seasonId/edit', [requireAuthentication, requirePermissions('seasons:update'), Pages__seasons__edit]),
	],
};
