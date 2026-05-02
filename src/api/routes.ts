import { except, route } from 'rwsdk/router';
import recipesImportsScrapes from './recipes/imports/scrapes';
import recipesImportsUploads from './recipes/imports/uploads';
import { apiErrorResponse } from './utils';

export default [
	except(error => apiErrorResponse(error)),
	route('/recipes/imports/scrapes', recipesImportsScrapes),
	route('/recipes/imports/uploads', recipesImportsUploads),
];
