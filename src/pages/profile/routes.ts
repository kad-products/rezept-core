import { route } from 'rwsdk/router';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import Pages__api_keys__edit from './edit-api-key';
import Pages__permissions__override from './override-permissions';
import Pages__profile__root from './root';

export default {
	app: [
		route('/', [requireAuthentication, requirePermissions('profile:read'), Pages__profile__root]),
		route('/api-keys/new', [requireAuthentication, requirePermissions('api-keys:read'), Pages__api_keys__edit]),
		route('/permissions/override', [
			requireAuthentication,
			requirePermissions('permissions:override'),
			Pages__permissions__override,
		]),
	],
};
