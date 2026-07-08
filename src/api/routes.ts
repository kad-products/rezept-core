import { except, route } from 'rwsdk/router';
import images from './images';
import recipesImportsScrapes from './recipes/imports/scrapes';
import recipesImportsUploads from './recipes/imports/uploads';
import recipesSearch from './recipes/search';
import { apiErrorResponse } from './utils';
import workflows from './workflows';

export default [
	except(error => apiErrorResponse(error)),
	route('/images/:imageId', images),
	route('/recipes/search', recipesSearch),
	route('/recipes/imports/scrapes', recipesImportsScrapes),
	route('/recipes/imports/uploads', recipesImportsUploads),
	route('/workflows/:workflowName', workflows),
	route('*', () => Response.json({ success: false, error: 'Not found' }, { status: 404 })),
];
