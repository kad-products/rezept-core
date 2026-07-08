import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createUser, getImageTypeByName } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createImage } from '../images';
import { createRecipe, deleteRecipe, getRecipeById, getRecipes, updateRecipe, updateRecipeCoverImage } from '../recipes';

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
			it('returns recipes matching an exact source', async () => {
				await createRecipe({ ...baseRecipeData, title: 'Match', source: 'https://example.com/recipe' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'No match', source: 'https://other.com/recipe' }, testUserId, logger);

				const result = await getRecipes({ source: 'https://example.com/recipe' }, 10, 0, logger);
				expect(result).toHaveLength(1);
				expect(result[0].title).toBe('Match');
			});

			it('matches recipes whose source contains the filter string', async () => {
				await createRecipe({ ...baseRecipeData, title: 'Match 1', source: 'https://example.com/recipe-1' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'Match 2', source: 'https://example.com/recipe-2' }, testUserId, logger);
				await createRecipe({ ...baseRecipeData, title: 'No match', source: 'https://other.com/recipe' }, testUserId, logger);

				const result = await getRecipes({ source: 'example.com' }, 10, 0, logger);
				expect(result).toHaveLength(2);
				expect(result.map(r => r.title)).toEqual(expect.arrayContaining(['Match 1', 'Match 2']));
			});

			it('returns empty array when source does not match', async () => {
				await createRecipe({ ...baseRecipeData, source: 'https://example.com/recipe' }, testUserId, logger);

				const result = await getRecipes({ source: 'https://notfound.com/recipe' }, 10, 0, logger);
				expect(result).toEqual([]);
			});

			it('does not return deleted recipes matching source', async () => {
				const r = await createRecipe({ ...baseRecipeData, source: 'https://example.com/recipe' }, testUserId, logger);
				await deleteRecipe(r.id, testUserId, logger);

				const result = await getRecipes({ source: 'https://example.com/recipe' }, 10, 0, logger);
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
			it('returns only recipes matching both source and id (AND logic)', async () => {
				const r1 = await createRecipe(
					{ ...baseRecipeData, title: 'Source match, id match', source: 'https://example.com/recipe' },
					testUserId,
					logger,
				);
				const r2 = await createRecipe(
					{ ...baseRecipeData, title: 'Source match, id no match', source: 'https://example.com/other' },
					testUserId,
					logger,
				);
				await createRecipe({ ...baseRecipeData, title: 'Neither' }, testUserId, logger);

				const result = await getRecipes({ source: 'example.com', id: [r1.id, r2.id] }, 10, 0, logger);
				expect(result).toHaveLength(2);
				expect(result.map(r => r.id)).toEqual(expect.arrayContaining([r1.id, r2.id]));
			});

			it('excludes recipes matching source but not id', async () => {
				const r1 = await createRecipe(
					{ ...baseRecipeData, title: 'In id list', source: 'https://example.com/recipe' },
					testUserId,
					logger,
				);
				await createRecipe(
					{ ...baseRecipeData, title: 'Not in id list', source: 'https://example.com/other' },
					testUserId,
					logger,
				);

				const result = await getRecipes({ source: 'example.com', id: [r1.id] }, 10, 0, logger);
				expect(result).toHaveLength(1);
				expect(result[0].id).toBe(r1.id);
			});
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
					source: 'https://example.com',
					servings: 4,
					prepTime: 15,
					cookTime: 30,
				},
				testUserId,
				logger,
			);

			expect(result.description).toBe('A great recipe');
			expect(result.source).toBe('https://example.com');
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
});
