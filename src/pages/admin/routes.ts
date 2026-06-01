import { route } from 'rwsdk/router';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import Pages__admin__index from './index';

export default {
	admin: [route('/', [requireAuthentication, requirePermissions('admin:read'), Pages__admin__index])],
};
