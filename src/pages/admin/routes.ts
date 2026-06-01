import { route } from 'rwsdk/router';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import Pages__admin__index from './index';
import Pages__admin__users from './users';

export default {
	admin: [
		route('/', [requireAuthentication, requirePermissions('admin:read'), Pages__admin__index]),
		route('/users', [requireAuthentication, requirePermissions('users:read'), Pages__admin__users]),
	],
};
