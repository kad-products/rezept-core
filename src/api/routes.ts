import { route } from 'rwsdk/router';
import API__recipes__import_bookmarklet from './recipes-import-bookmarklet';
import API__recipes__import_upload from './recipes-import-upload';

export default [
	route('/recipes/import', API__recipes__import_upload),
	route('/recipes/import/bookmarklet', API__recipes__import_bookmarklet),
];
