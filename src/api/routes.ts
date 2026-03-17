import { route } from 'rwsdk/router';
import API__recipes__scrapes from './recipes-scrapes';
import API__recipes__upload from './recipes-upload';

export default [route('/recipes/uploads', API__recipes__upload), route('/recipes/scrapes', API__recipes__scrapes)];
