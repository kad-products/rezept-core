import { route } from 'rwsdk/router';
import Pages__lists__edit from './edit';
import Pages__lists__listing from './listing';
import Pages__lists__view from './view';

export default [
	route('/', Pages__lists__listing),
	route('/:listId', Pages__lists__view),
	route('/:listId/edit', Pages__lists__edit),
];
