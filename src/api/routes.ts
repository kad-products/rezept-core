import { except, route } from 'rwsdk/router';
import images from './images';
import recipesImportsScrapes from './recipes/imports/scrapes';
import recipesImportsUploads from './recipes/imports/uploads';
import { apiErrorResponse } from './utils';

export default [
	except(error => apiErrorResponse(error)),
	route('/images/:imageId', images),
	route('/recipes/imports/scrapes', recipesImportsScrapes),
	route('/recipes/imports/uploads', recipesImportsUploads),
	route('*', () => Response.json({ success: false, error: 'Not found' }, { status: 404 })),
];
