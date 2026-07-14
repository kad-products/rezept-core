import { route } from 'rwsdk/router';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import Pages__admin__growing_zones__edit from './growing-zones/edit';
import Pages__admin__growing_zones__listing from './growing-zones/listing';
import Pages__admin__index from './index';
import Pages__admin__ingredients__edit from './ingredients/edit';
import Pages__admin__ingredients__listing from './ingredients/listing';
import Pages__admin__ingredients__season_verify from './ingredients/season-verify';
import Pages__admin__ingredients__seasons from './ingredients/seasons';
import Pages__admin__ingredients__verify from './ingredients/verify';
import AdminNotFound from './not-found';
import Pages__admin__recipes__scrapes__listing from './recipes/scrapes/listing';
import Pages__admin__recipes__scrapes__view from './recipes/scrapes/view';
import Pages__admin__users__edit from './users/edit';
import Pages__admin__users__listing from './users/listing';

export default {
	admin: [
		route('/', [requireAuthentication, requirePermissions('admin:read'), Pages__admin__index]),
		route('/growing-zones', [
			requireAuthentication,
			requirePermissions('growing-zones:read'),
			Pages__admin__growing_zones__listing,
		]),
		route('/growing-zones/new', [
			requireAuthentication,
			requirePermissions('growing-zones:create'),
			Pages__admin__growing_zones__edit,
		]),
		route('/growing-zones/:growingZoneId/edit', [
			requireAuthentication,
			requirePermissions('growing-zones:update'),
			Pages__admin__growing_zones__edit,
		]),
		route('/ingredients', [requireAuthentication, requirePermissions('ingredients:read'), Pages__admin__ingredients__listing]),
		route('/ingredients/new', [requireAuthentication, requirePermissions('ingredients:create'), Pages__admin__ingredients__edit]),
		route('/ingredients/:ingredientId/edit', [
			requireAuthentication,
			requirePermissions('ingredients:update'),
			Pages__admin__ingredients__edit,
		]),
		route('/ingredients/:ingredientId/seasons', [
			requireAuthentication,
			requirePermissions('ingredients:update'),
			Pages__admin__ingredients__seasons,
		]),
		route('/ingredients/:ingredientId/verify', [
			requireAuthentication,
			requirePermissions('ingredients:update'),
			Pages__admin__ingredients__verify,
		]),
		route('/ingredients/:ingredientId/seasons/:ingredientSeasonId/verify', [
			requireAuthentication,
			requirePermissions('ingredients:update'),
			Pages__admin__ingredients__season_verify,
		]),
		route('/recipes/scrapes', [
			requireAuthentication,
			requirePermissions('recipes:read'),
			Pages__admin__recipes__scrapes__listing,
		]),
		route('/recipes/scrapes/:recipeScrapeId', [
			requireAuthentication,
			requirePermissions('recipes:scrape'),
			Pages__admin__recipes__scrapes__view,
		]),
		route('/users', [requireAuthentication, requirePermissions('users:read'), Pages__admin__users__listing]),
		route('/users/:userId/edit', [requireAuthentication, requirePermissions('users:update'), Pages__admin__users__edit]),
		route('*', AdminNotFound),
	],
};
