import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createGrowingZone, createIngredient, createIngredientSeason, createUser, getImageTypeByName } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createImage } from '../images';
import { updateRecipeIngredients } from '../recipe-ingredients';
import { updateRecipeSections } from '../recipe-sections';
import {
	countRecipes,
	createRecipe,
	deleteRecipe,
	getRecipeById,
	getRecipes,
	searchRecipes,
	updateRecipe,
	updateRecipeCoverImage,
} from '../recipes';

const logger = createNoopLogger();

describe('recipes repository', () => {
	let testUserId: string;
	let baseRecipeData: { authorId: string; title: string };

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
		baseRecipeData = { authorId: testUserId, title: 'Test Recipe' };
	});

	describe('getRecipes', () => {
		describe('no filters', () => {
			it('returns empty array when no recipes exist', async () => {
				const result = await getRecipes({}, 10, 0, logger);
				expect(result).toEqual([]);
			});

			it('returns all non-deleted recipes', async () => {
				await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 3' }, testUserId, logger);

				const result = await getRecipes({}, 10, 0, logger);
				expect(result).toHaveLength(3);
			});

			it('returns recipes with correct shape', async () => {
				await createRecipe(baseRecipeData, testUserId, logger);

				const result = await getRecipes({}, 10, 0, logger);
				expect(result[0]).toMatchObject({
					title: 'Test Recipe',
					authorId: testUserId,
					createdBy: testUserId,
				});
				expect(result[0].id).toBeDefined();
			});

			it('excludes soft-deleted recipes', async () => {
				const r1 = await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);
				await deleteRecipe(r1.id, testUserId, logger);

				const result = await getRecipes({}, 10, 0, logger);
				expect(result).toHaveLength(1);
				expect(result[0].title).toBe('Recipe 2');
			});
		});

		describe('pagination', () => {
			it('respects limit', async () => {
				await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 3' }, testUserId, logger);

				const result = await getRecipes({}, 2, 0, logger);
				expect(result).toHaveLength(2);
			});

			it('respects offset', async () => {
				await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 3' }, testUserId, logger);

				const page1 = await getRecipes({}, 2, 0, logger);
				const page2 = await getRecipes({}, 2, 2, logger);
				expect(page1).toHaveLength(2);
				expect(page2).toHaveLength(1);
				expect([...page1, ...page2].map(r => r.title)).toEqual(['Recipe 1', 'Recipe 2', 'Recipe 3']);
			});
		});

		describe('source filter', () => {
			it('returns the recipe matching the exact normalized source', async () => {
				await createRecipe({ ...baseRecipeData, title: 'Match', source: 'example.com/recipe' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'No match', source: 'other.com/recipe' }, testUserId, logger);

				const result = await getRecipes({ source: 'example.com/recipe' }, 10, 0, logger);
				expect(result).toHaveLength(1);
				expect(result[0].title).toBe('Match');
			});

			it('returns empty array when source does not exactly match', async () => {
				await createRecipe({ ...baseRecipeData, source: 'example.com/recipe' }, testUserId, logger);

				const result = await getRecipes({ source: 'example.com' }, 10, 0, logger);
				expect(result).toEqual([]);
			});

			it('returns empty array when source does not match', async () => {
				await createRecipe({ ...baseRecipeData, source: 'example.com/recipe' }, testUserId, logger);

				const result = await getRecipes({ source: 'notfound.com/recipe' }, 10, 0, logger);
				expect(result).toEqual([]);
			});

			it('does not return deleted recipes matching source', async () => {
				const r = await createRecipe({ ...baseRecipeData, source: 'example.com/recipe' }, testUserId, logger);
				await deleteRecipe(r.id, testUserId, logger);

				const result = await getRecipes({ source: 'example.com/recipe' }, 10, 0, logger);
				expect(result).toEqual([]);
			});
		});

		describe('id filter', () => {
			it('returns recipes matching a single id', async () => {
				const r1 = await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);

				const result = await getRecipes({ id: [r1.id] }, 10, 0, logger);
				expect(result).toHaveLength(1);
				expect(result[0].id).toBe(r1.id);
			});

			it('returns recipes matching multiple ids', async () => {
				const r1 = await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
				const r2 = await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Recipe 3' }, testUserId, logger);

				const result = await getRecipes({ id: [r1.id, r2.id] }, 10, 0, logger);
				expect(result).toHaveLength(2);
				expect(result.map(r => r.id)).toEqual(expect.arrayContaining([r1.id, r2.id]));
			});

			it('returns empty array when no ids match', async () => {
				await createRecipe(baseRecipeData, testUserId, logger);

				const result = await getRecipes({ id: [crypto.randomUUID()] }, 10, 0, logger);
				expect(result).toEqual([]);
			});

			it('does not return deleted recipes matching id', async () => {
				const r = await createRecipe(baseRecipeData, testUserId, logger);
				await deleteRecipe(r.id, testUserId, logger);

				const result = await getRecipes({ id: [r.id] }, 10, 0, logger);
				expect(result).toEqual([]);
			});
		});

		describe('source and id filters combined', () => {
			it('returns only the recipe matching both exact source and id (AND logic)', async () => {
				const r1 = await createRecipe(
					{ ...baseRecipeData, title: 'Source match, id match', source: 'example.com/recipe' },
					testUserId,
					logger,
				);
				await createRecipe({ ...baseRecipeData, title: 'Id match only', source: 'other.com/recipe' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Neither' }, testUserId, logger);

				const result = await getRecipes({ source: 'example.com/recipe', id: [r1.id] }, 10, 0, logger);
				expect(result).toHaveLength(1);
				expect(result[0].id).toBe(r1.id);
			});

			it('excludes recipes matching source but not id', async () => {
				const r1 = await createRecipe(
					{ ...baseRecipeData, title: 'In id list', source: 'example.com/recipe' },
					testUserId,
					logger,
				);
				await createRecipe({ ...baseRecipeData, title: 'Not in id list', source: 'example.com/other' }, testUserId, logger);

				const result = await getRecipes({ source: 'example.com/recipe', id: [r1.id] }, 10, 0, logger);
				expect(result).toHaveLength(1);
				expect(result[0].id).toBe(r1.id);
			});
		});
	});

	describe('countRecipes', () => {
		it('returns 0 when no recipes exist', async () => {
			expect(await countRecipes({}, logger)).toBe(0);
		});

		it('counts all non-deleted recipes', async () => {
			await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
			await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);
			await createRecipe({ ...baseRecipeData, title: 'Recipe 3' }, testUserId, logger);

			expect(await countRecipes({}, logger)).toBe(3);
		});

		it('excludes soft-deleted recipes', async () => {
			const r1 = await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
			await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);
			await deleteRecipe(r1.id, testUserId, logger);

			expect(await countRecipes({}, logger)).toBe(1);
		});

		it('filters by exact source', async () => {
			await createRecipe({ ...baseRecipeData, source: 'example.com/recipe' }, testUserId, logger);
			await createRecipe({ ...baseRecipeData, source: 'other.com/recipe' }, testUserId, logger);

			expect(await countRecipes({ source: 'example.com/recipe' }, logger)).toBe(1);
		});

		it('filters by id', async () => {
			const r1 = await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
			await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);

			expect(await countRecipes({ id: [r1.id] }, logger)).toBe(1);
		});

		it('returns a count consistent with getRecipes for the same filters', async () => {
			await createRecipe({ ...baseRecipeData, title: 'Recipe 1', source: 'example.com/one' }, testUserId, logger);
			await createRecipe({ ...baseRecipeData, title: 'Recipe 2', source: 'example.com/two' }, testUserId, logger);
			await createRecipe({ ...baseRecipeData, title: 'Recipe 3', source: 'other.com/three' }, testUserId, logger);

			const filters = { source: 'example.com/one' };
			const [rows, total] = await Promise.all([getRecipes(filters, 10, 0, logger), countRecipes(filters, logger)]);

			expect(rows).toHaveLength(total);
		});
	});

	describe('getRecipeById', () => {
		it('returns recipe by id', async () => {
			const created = await createRecipe(baseRecipeData, testUserId, logger);

			const result = await getRecipeById(created.id, logger);
			expect(result.id).toBe(created.id);
			expect(result.title).toBe('Test Recipe');
		});

		it('returns correct recipe when multiple exist', async () => {
			await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
			const recipe2 = await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);

			const result = await getRecipeById(recipe2.id, logger);
			expect(result.id).toBe(recipe2.id);
			expect(result.title).toBe('Recipe 2');
		});

		it('throws when recipe does not exist', async () => {
			await expect(getRecipeById(crypto.randomUUID(), logger)).rejects.toThrow('Expected 1 Recipe record(s), but found 0');
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(getRecipeById('not-a-uuid', logger)).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a Recipe');
		});

		it('throws when id is an empty string', async () => {
			await expect(getRecipeById('', logger)).rejects.toThrow('The value "" is not a valid ID for a Recipe');
		});
	});

	describe('createRecipe', () => {
		it('normalizes source by stripping protocol and trailing slash', async () => {
			const result = await createRecipe({ ...baseRecipeData, source: 'https://example.com/recipe/' }, testUserId, logger);
			expect(result.source).toBe('example.com/recipe');
		});

		it('handles http protocol', async () => {
			const result = await createRecipe({ ...baseRecipeData, source: 'http://example.com/recipe' }, testUserId, logger);
			expect(result.source).toBe('example.com/recipe');
		});

		it('handles source already without protocol', async () => {
			const result = await createRecipe({ ...baseRecipeData, source: 'example.com/recipe' }, testUserId, logger);
			expect(result.source).toBe('example.com/recipe');
		});

		it('handles multiple trailing slashes', async () => {
			const result = await createRecipe({ ...baseRecipeData, source: 'https://example.com/recipe///' }, testUserId, logger);
			expect(result.source).toBe('example.com/recipe');
		});

		it('throws on duplicate source with a cause chain including the constraint name', async () => {
			await createRecipe({ ...baseRecipeData, source: 'example.com/recipe' }, testUserId, logger);

			const err = await createRecipe({ ...baseRecipeData, source: 'example.com/recipe' }, testUserId, logger).catch(e => e);

			expect(err).toBeInstanceOf(Error);
			// Walk the cause chain until we find the SQLite constraint message
			let cause: unknown = err;
			let found = false;
			while (cause instanceof Error) {
				if (cause.message.includes('UNIQUE constraint failed')) {
					found = true;
					break;
				}
				cause = cause.cause;
			}
			expect(found, `Expected "UNIQUE constraint failed" somewhere in the cause chain. Full error: ${err}`).toBe(true);
		});

		it('creates a recipe with required fields', async () => {
			const result = await createRecipe(baseRecipeData, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.title).toBe('Test Recipe');
			expect(result.authorId).toBe(testUserId);
		});

		it('sets createdBy to userId', async () => {
			const result = await createRecipe(baseRecipeData, testUserId, logger);
			expect(result.createdBy).toBe(testUserId);
		});

		it('sets audit fields correctly', async () => {
			const result = await createRecipe(baseRecipeData, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates recipe with optional fields', async () => {
			const result = await createRecipe(
				{
					...baseRecipeData,
					description: 'A great recipe',
					source: 'example.com',
					servings: 4,
					prepTime: 15,
					cookTime: 30,
				},
				testUserId,
				logger,
			);

			expect(result.description).toBe('A great recipe');
			expect(result.source).toBe('example.com');
			expect(result.servings).toBe(4);
			expect(result.prepTime).toBe(15);
			expect(result.cookTime).toBe(30);
		});

		it('defaults optional fields to null when not provided', async () => {
			const result = await createRecipe(baseRecipeData, testUserId, logger);

			expect(result.description).toBeNull();
			expect(result.source).toBeNull();
			expect(result.servings).toBeNull();
			expect(result.prepTime).toBeNull();
			expect(result.cookTime).toBeNull();
			expect(result.coverImageId).toBeNull();
		});

		it('creates recipe with a cover image', async () => {
			const imageType = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
			const image = await createImage(
				{ imageTypeId: imageType.id, name: 'test-image', originalFilename: 'test.jpg', mimeType: 'image/jpeg', fileSize: 1024 },
				testUserId,
				logger,
			);

			const result = await createRecipe({ ...baseRecipeData, coverImageId: image.id }, testUserId, logger);
			expect(result.coverImageId).toBe(image.id);
		});

		it('creates multiple recipes with unique ids', async () => {
			const recipe1 = await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
			const recipe2 = await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);

			expect(recipe1.id).not.toBe(recipe2.id);
		});
	});

	describe('deleteRecipe', () => {
		it('soft-deletes the recipe and returns it with deletedAt set', async () => {
			const created = await createRecipe(baseRecipeData, testUserId, logger);

			const deleted = await deleteRecipe(created.id, testUserId, logger);

			expect(deleted.id).toBe(created.id);
			expect(deleted.deletedAt).not.toBeNull();
			expect(deleted.deletedBy).toBe(testUserId);
		});

		it('does not return deleted recipe from getRecipes', async () => {
			const created = await createRecipe(baseRecipeData, testUserId, logger);
			await deleteRecipe(created.id, testUserId, logger);

			const result = await getRecipes({}, 10, 0, logger);
			expect(result).toHaveLength(0);
		});

		it('throws when recipe does not exist', async () => {
			await expect(deleteRecipe(crypto.randomUUID(), testUserId, logger)).rejects.toThrow(
				'Expected 1 Recipe record(s), but found 0',
			);
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(deleteRecipe('not-a-uuid', testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Recipe',
			);
		});
	});

	describe('updateRecipeCoverImage', () => {
		it('sets coverImageId on the recipe', async () => {
			const imageType = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
			const image = await createImage(
				{ imageTypeId: imageType.id, name: 'cover', originalFilename: 'cover.jpg', mimeType: 'image/jpeg', fileSize: 1024 },
				testUserId,
				logger,
			);
			const recipe = await createRecipe(baseRecipeData, testUserId, logger);
			expect(recipe.coverImageId).toBeNull();

			const result = await updateRecipeCoverImage(recipe.id, image.id, testUserId, logger);
			expect(result.coverImageId).toBe(image.id);
		});

		it('sets updatedBy and updatedAt', async () => {
			const imageType = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
			const image = await createImage(
				{ imageTypeId: imageType.id, name: 'cover', originalFilename: 'cover.jpg', mimeType: 'image/jpeg', fileSize: 1024 },
				testUserId,
				logger,
			);
			const recipe = await createRecipe(baseRecipeData, testUserId, logger);

			const result = await updateRecipeCoverImage(recipe.id, image.id, testUserId, logger);
			expect(result.updatedBy).toBe(testUserId);
			expect(result.updatedAt).not.toBeNull();
		});

		it('preserves other recipe fields', async () => {
			const imageType = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
			const image = await createImage(
				{ imageTypeId: imageType.id, name: 'cover', originalFilename: 'cover.jpg', mimeType: 'image/jpeg', fileSize: 1024 },
				testUserId,
				logger,
			);
			const recipe = await createRecipe(
				{ ...baseRecipeData, description: 'Original description', servings: 4 },
				testUserId,
				logger,
			);

			const result = await updateRecipeCoverImage(recipe.id, image.id, testUserId, logger);
			expect(result.title).toBe(recipe.title);
			expect(result.description).toBe('Original description');
			expect(result.servings).toBe(4);
		});

		it('does not affect other recipes', async () => {
			const imageType = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
			const image = await createImage(
				{ imageTypeId: imageType.id, name: 'cover', originalFilename: 'cover.jpg', mimeType: 'image/jpeg', fileSize: 1024 },
				testUserId,
				logger,
			);
			const recipe1 = await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
			const recipe2 = await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);

			await updateRecipeCoverImage(recipe1.id, image.id, testUserId, logger);

			const unchanged = await getRecipeById(recipe2.id, logger);
			expect(unchanged.coverImageId).toBeNull();
		});

		it('throws when recipe does not exist', async () => {
			await expect(updateRecipeCoverImage(crypto.randomUUID(), crypto.randomUUID(), testUserId, logger)).rejects.toThrow(
				'Expected 1 Recipe record(s), but found 0',
			);
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(updateRecipeCoverImage('not-a-uuid', crypto.randomUUID(), testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Recipe',
			);
		});
	});

	describe('updateRecipe', () => {
		it('normalizes source on update', async () => {
			const created = await createRecipe(baseRecipeData, testUserId, logger);

			const result = await updateRecipe(
				created.id,
				{ ...baseRecipeData, source: 'https://example.com/recipe/' },
				testUserId,
				logger,
			);
			expect(result.source).toBe('example.com/recipe');
		});

		it('updates recipe fields', async () => {
			const created = await createRecipe(baseRecipeData, testUserId, logger);

			const result = await updateRecipe(
				created.id,
				{ ...baseRecipeData, title: 'Updated Title', servings: 6 },
				testUserId,
				logger,
			);

			expect(result.title).toBe('Updated Title');
			expect(result.servings).toBe(6);
		});

		it('sets updatedBy to userId', async () => {
			const created = await createRecipe(baseRecipeData, testUserId, logger);

			const result = await updateRecipe(created.id, baseRecipeData, testUserId, logger);
			expect(result.updatedBy).toBe(testUserId);
		});

		it('does not affect other recipes', async () => {
			const recipe1 = await createRecipe({ ...baseRecipeData, title: 'Recipe 1' }, testUserId, logger);
			const recipe2 = await createRecipe({ ...baseRecipeData, title: 'Recipe 2' }, testUserId, logger);

			await updateRecipe(recipe1.id, { ...baseRecipeData, title: 'Updated' }, testUserId, logger);

			const unchanged = await getRecipeById(recipe2.id, logger);
			expect(unchanged.title).toBe('Recipe 2');
		});

		it('preserves fields not being updated', async () => {
			const created = await createRecipe({ ...baseRecipeData, description: 'Original description' }, testUserId, logger);

			const result = await updateRecipe(created.id, baseRecipeData, testUserId, logger);
			expect(result.description).toBe('Original description');
		});

		it('sets coverImageId on update', async () => {
			const imageType = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
			const image = await createImage(
				{ imageTypeId: imageType.id, name: 'cover-image', originalFilename: 'cover.jpg', mimeType: 'image/jpeg', fileSize: 2048 },
				testUserId,
				logger,
			);
			const created = await createRecipe(baseRecipeData, testUserId, logger);
			expect(created.coverImageId).toBeNull();

			const result = await updateRecipe(created.id, { ...baseRecipeData, coverImageId: image.id }, testUserId, logger);
			expect(result.coverImageId).toBe(image.id);
		});

		it('throws when recipe does not exist', async () => {
			await expect(updateRecipe(crypto.randomUUID(), baseRecipeData, testUserId, logger)).rejects.toThrow(
				'Expected 1 Recipe record(s), but found 0',
			);
		});

		it('creates recipe without coverImageId when not provided', async () => {
			const result = await createRecipe(baseRecipeData, testUserId, logger);
			expect(result.coverImageId).toBeNull();
		});
	});

	describe('searchRecipes', () => {
		// currentMonth is used to create seasons that are/aren't active right now.
		// outOfSeasonMonth is always a different month so the season never matches.
		const currentMonth = new Date().getMonth() + 1;
		const outOfSeasonMonth = (currentMonth % 12) + 1;

		let testGrowingZoneId: string;
		let testIngredientId: string;

		// Creates a recipe with one section and one recipe_ingredient linked to testIngredientId.
		async function createLinkedRecipe(title: string): Promise<string> {
			const recipe = await createRecipe({ ...baseRecipeData, title }, testUserId, logger);
			const [section] = await updateRecipeSections(recipe.id, [{ order: 1 }], testUserId, logger);
			await updateRecipeIngredients(section.id, [{ ingredientId: testIngredientId, order: 1 }], testUserId, logger);
			return recipe.id;
		}

		beforeEach(async () => {
			const growingZone = await createGrowingZone(
				{ name: 'US Pacific Northwest', code: 'us_pacific_northwest' },
				testUserId,
				logger,
			);
			testGrowingZoneId = growingZone.id;
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			testIngredientId = ingredient.id;
		});

		it('returns empty array when no recipes exist', async () => {
			const result = await searchRecipes({ growingZoneId: testGrowingZoneId }, logger);
			expect(result).toEqual([]);
		});

		it('returns empty array when no growingZoneId is provided', async () => {
			const result = await searchRecipes({}, logger);
			expect(result).toEqual([]);
		});

		it('returns a recipe whose ingredient is in season for the growing zone', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: currentMonth, endMonth: currentMonth },
				testUserId,
				logger,
			);
			await createLinkedRecipe('Tomato Salad');

			const result = await searchRecipes({ growingZoneId: testGrowingZoneId }, logger);
			expect(result).toHaveLength(1);
			expect(result[0].title).toBe('Tomato Salad');
		});

		it('does not return a recipe whose ingredient season is outside the current month', async () => {
			await createIngredientSeason(
				{
					ingredientId: testIngredientId,
					growingZoneId: testGrowingZoneId,
					startMonth: outOfSeasonMonth,
					endMonth: outOfSeasonMonth,
				},
				testUserId,
				logger,
			);
			await createLinkedRecipe('Tomato Salad');

			const result = await searchRecipes({ growingZoneId: testGrowingZoneId }, logger);
			expect(result).toEqual([]);
		});

		it('does not return a recipe whose ingredient season is in a different growing zone', async () => {
			const otherZone = await createGrowingZone({ name: 'US Gulf Coast', code: 'us_gulf_coast' }, testUserId, logger);
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: otherZone.id, startMonth: currentMonth, endMonth: currentMonth },
				testUserId,
				logger,
			);
			await createLinkedRecipe('Tomato Salad');

			const result = await searchRecipes({ growingZoneId: testGrowingZoneId }, logger);
			expect(result).toEqual([]);
		});

		it('filters by title search term', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: currentMonth, endMonth: currentMonth },
				testUserId,
				logger,
			);
			await createLinkedRecipe('Tomato Salad');
			await createLinkedRecipe('Tomato Soup');

			const result = await searchRecipes({ growingZoneId: testGrowingZoneId, term: 'Soup' }, logger);
			expect(result).toHaveLength(1);
			expect(result[0].title).toBe('Tomato Soup');
		});

		it('returns all seasonal recipes when no search term is provided', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: currentMonth, endMonth: currentMonth },
				testUserId,
				logger,
			);
			await createLinkedRecipe('Tomato Salad');
			await createLinkedRecipe('Tomato Soup');

			const result = await searchRecipes({ growingZoneId: testGrowingZoneId }, logger);
			expect(result).toHaveLength(2);
		});

		it('does not return duplicate recipes when a recipe has multiple seasonal ingredients', async () => {
			const otherIngredient = await createIngredient({ name: 'Basil' }, testUserId, logger);
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: currentMonth, endMonth: currentMonth },
				testUserId,
				logger,
			);
			await createIngredientSeason(
				{ ingredientId: otherIngredient.id, growingZoneId: testGrowingZoneId, startMonth: currentMonth, endMonth: currentMonth },
				testUserId,
				logger,
			);
			const recipe = await createRecipe({ ...baseRecipeData, title: 'Caprese' }, testUserId, logger);
			const [section] = await updateRecipeSections(recipe.id, [{ order: 1 }], testUserId, logger);
			await updateRecipeIngredients(
				section.id,
				[
					{ ingredientId: testIngredientId, order: 1 },
					{ ingredientId: otherIngredient.id, order: 2 },
				],
				testUserId,
				logger,
			);

			const result = await searchRecipes({ growingZoneId: testGrowingZoneId }, logger);
			expect(result).toHaveLength(1);
		});

		it('orders results by title', async () => {
			await createIngredientSeason(
				{ ingredientId: testIngredientId, growingZoneId: testGrowingZoneId, startMonth: currentMonth, endMonth: currentMonth },
				testUserId,
				logger,
			);
			await createLinkedRecipe('Zucchini Pasta');
			await createLinkedRecipe('Arugula Salad');
			await createLinkedRecipe('Minestrone');

			const result = await searchRecipes({ growingZoneId: testGrowingZoneId }, logger);
			expect(result.map(r => r.title)).toEqual(['Arugula Salad', 'Minestrone', 'Zucchini Pasta']);
		});
	});
});
