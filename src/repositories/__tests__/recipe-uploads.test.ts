import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createRecipeUpload, getRecipeUploadById, getRecipeUploads } from '../recipe-uploads';

const logger = new Logger();

const baseUploadData = {
	originalFilename: 'recipe.pdf',
	r2Key: 'uploads/recipe.pdf',
	mimeType: 'application/pdf',
	fileSize: 102400,
};

describe('recipe-uploads repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
	});

	describe('createRecipeUpload', () => {
		it('creates a recipe upload with required fields', async () => {
			const result = await createRecipeUpload(baseUploadData, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.originalFilename).toBe('recipe.pdf');
			expect(result.r2Key).toBe('uploads/recipe.pdf');
			expect(result.mimeType).toBe('application/pdf');
			expect(result.fileSize).toBe(102400);
		});

		it('sets userId and createdBy to userId', async () => {
			const result = await createRecipeUpload(baseUploadData, testUserId, logger);

			expect(result.userId).toBe(testUserId);
			expect(result.createdBy).toBe(testUserId);
		});

		it('defaults status to UPLOADED', async () => {
			const result = await createRecipeUpload(baseUploadData, testUserId, logger);
			expect(result.status).toBe('UPLOADED');
		});

		it('sets audit fields correctly', async () => {
			const result = await createRecipeUpload(baseUploadData, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates multiple uploads with unique ids', async () => {
			const upload1 = await createRecipeUpload({ ...baseUploadData, r2Key: 'uploads/a.pdf' }, testUserId, logger);
			const upload2 = await createRecipeUpload({ ...baseUploadData, r2Key: 'uploads/b.pdf' }, testUserId, logger);

			expect(upload1.id).not.toBe(upload2.id);
		});
	});

	describe('getRecipeUploads', () => {
		it('returns empty array when user has no uploads', async () => {
			const result = await getRecipeUploads(testUserId, logger);
			expect(result).toEqual([]);
		});

		it('returns all uploads for user', async () => {
			await createRecipeUpload({ ...baseUploadData, r2Key: 'uploads/a.pdf' }, testUserId, logger);
			await createRecipeUpload({ ...baseUploadData, r2Key: 'uploads/b.pdf' }, testUserId, logger);
			await createRecipeUpload({ ...baseUploadData, r2Key: 'uploads/c.pdf' }, testUserId, logger);

			const result = await getRecipeUploads(testUserId, logger);
			expect(result).toHaveLength(3);
		});

		it('returns only uploads for specified user', async () => {
			const otherUser = await createUser('otheruser', null, logger);

			await createRecipeUpload({ ...baseUploadData, r2Key: 'uploads/mine.pdf' }, testUserId, logger);
			await createRecipeUpload({ ...baseUploadData, r2Key: 'uploads/theirs.pdf' }, otherUser.id, logger);

			const result = await getRecipeUploads(testUserId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].userId).toBe(testUserId);
		});

		it('returns empty array for user with no uploads even when others have uploads', async () => {
			const otherUser = await createUser('otheruser', null, logger);
			await createRecipeUpload(baseUploadData, otherUser.id, logger);

			const result = await getRecipeUploads(testUserId, logger);
			expect(result).toEqual([]);
		});
	});

	describe('getRecipeUploadById', () => {
		it('returns upload by id', async () => {
			const created = await createRecipeUpload(baseUploadData, testUserId, logger);

			const result = await getRecipeUploadById(created.id, logger);
			expect(result.id).toBe(created.id);
			expect(result.originalFilename).toBe('recipe.pdf');
		});

		it('returns correct upload when multiple exist', async () => {
			await createRecipeUpload({ ...baseUploadData, r2Key: 'uploads/a.pdf', originalFilename: 'a.pdf' }, testUserId, logger);
			const target = await createRecipeUpload(
				{ ...baseUploadData, r2Key: 'uploads/b.pdf', originalFilename: 'b.pdf' },
				testUserId,
				logger,
			);

			const result = await getRecipeUploadById(target.id, logger);
			expect(result.id).toBe(target.id);
			expect(result.originalFilename).toBe('b.pdf');
		});

		it('throws when upload does not exist', async () => {
			await expect(getRecipeUploadById(crypto.randomUUID(), logger)).rejects.toThrow(
				'Expected 1 RecipeUpload record(s), but found 0',
			);
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(getRecipeUploadById('not-a-uuid', logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a RecipeUpload',
			);
		});

		it('throws when id is an empty string', async () => {
			await expect(getRecipeUploadById('', logger)).rejects.toThrow('The value "" is not a valid ID for a RecipeUpload');
		});
	});
});
