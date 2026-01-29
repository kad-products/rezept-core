import { route } from 'rwsdk/router';
import Pages__recipes__listing from './listing';
import Pages__recipes__view from './view';

export default [route('/', Pages__recipes__listing), route('/:recipeId', Pages__recipes__view)];
