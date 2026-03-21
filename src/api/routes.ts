import { route } from 'rwsdk/router';
import recipesImportsScrapes from './recipes/imports/scrapes';
import recipesImportsUploads from './recipes/imports/uploads';

export default [
	route('/recipes/imports/scrapes', recipesImportsScrapes),
	route('/recipes/imports/uploads', recipesImportsUploads),
];
