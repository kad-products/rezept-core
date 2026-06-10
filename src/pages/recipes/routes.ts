import { route } from 'rwsdk/router';
import Pages__recipes__edit from './edit';
import Pages__recipes__listing from './listing';
import Pages__recipes__print from './print';
import Pages__recipes__scrapes__listing from './scrapes/listing';
import Pages__recipes__uploads__new from './uploads/form';
import Pages__recipes__uploads__listing from './uploads/listing';
import Pages__recipes__uploadView from './uploads/view';
import Pages__recipes__view from './view';

const appRoutes = [
	route('/', Pages__recipes__listing),
	route('/scrapes', Pages__recipes__scrapes__listing),
	route('/uploads', Pages__recipes__uploads__listing),
	route('/uploads/new', Pages__recipes__uploads__new),
	route('/new', Pages__recipes__edit),
	route('/:recipeId', Pages__recipes__view),
	route('/:recipeId/edit', Pages__recipes__edit),
	route('/uploads/:recipeUploadId', Pages__recipes__uploadView),
];

const noJsRoutes = [route('/:recipeId/print', Pages__recipes__print)];

export default {
	app: appRoutes,
	noJS: noJsRoutes,
};
