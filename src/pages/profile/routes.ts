import { route } from 'rwsdk/router';
import Pages__api_keys__edit from './edit-api-key';
import Pages__profile__root from './root';

export default [route('/', Pages__profile__root), route('/api-keys/new', Pages__api_keys__edit)];
