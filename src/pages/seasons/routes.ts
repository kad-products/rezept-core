import { route } from 'rwsdk/router';
import Pages__seasons__edit from './edit';
import Pages__seasons__listing from './listing';
import Pages__seasons__view from './view';

export default [
	route('/', Pages__seasons__listing),
	route('/new', Pages__seasons__edit),
	route('/:seasonId', Pages__seasons__view),
	route('/:seasonId/edit', Pages__seasons__edit),
];
