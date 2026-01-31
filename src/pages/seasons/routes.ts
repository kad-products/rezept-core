import { route } from 'rwsdk/router';
import Pages__seasons__listing from './listing';
import Pages__seasons__view from './view';

export default [route('/', Pages__seasons__listing), route('/:listId', Pages__seasons__view)];
