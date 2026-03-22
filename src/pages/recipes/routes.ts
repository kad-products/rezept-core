import { route } from 'rwsdk/router';
import Pages__recipes__edit from './edit';
import Pages__recipes__listing from './listing';
import Pages__recipes__upload from './upload';
import Pages__recipes__uploadView from './upload-view';
import Pages__recipes__view from './view';

export default [
	route('/', Pages__recipes__listing),
	route('/uploads/new', Pages__recipes__upload),
	route('/new', Pages__recipes__edit),
	route('/:recipeId', Pages__recipes__view),
	route('/:recipeId/edit', Pages__recipes__edit),
	route('/uploads/:recipeUploadId', Pages__recipes__uploadView),
];
