import { route } from 'rwsdk/router';
import Pages__recipes__edit from './edit';
import Pages__recipes__import from './import';
import Pages__recipes__listing from './listing';
import Pages__recipes__view from './view';

export default [
	route('/', Pages__recipes__listing),
	route('/import', Pages__recipes__import),
	route('/new', Pages__recipes__edit),
	route('/:recipeId', Pages__recipes__view),
	route('/:recipeId/edit', Pages__recipes__edit),
];
