import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser, getImageTypeByName } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createImage, deleteImage, getImageById, getImages, updateImage } from '../images';

const logger = new Logger();

describe('images repository', () => {
	let testUserId: string;
	let imageTypeId: string;
	let baseImageData: {
		imageTypeId: string;
		name: string;
		originalFilename: string;
		mimeType: string;
		fileSize: number;
	};

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
		const imageType = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
		imageTypeId = imageType.id;
		baseImageData = {
			imageTypeId,
			name: 'grandmas-corn-chowder',
			originalFilename: 'corn-chowder.jpg',
			mimeType: 'image/jpeg',
			fileSize: 204800,
		};
	});

	describe('getImages', () => {
		it('returns empty array when no images exist', async () => {
			const result = await getImages(logger);
			expect(result).toEqual([]);
		});

		it('returns all images', async () => {
			await createImage({ ...baseImageData, name: 'image-one' }, testUserId, logger);
			await createImage({ ...baseImageData, name: 'image-two' }, testUserId, logger);
			await createImage({ ...baseImageData, name: 'image-three' }, testUserId, logger);

			const result = await getImages(logger);
			expect(result).toHaveLength(3);
		});

		it('does not return deleted images', async () => {
			const created = await createImage(baseImageData, testUserId, logger);
			await deleteImage(created.id, testUserId, logger);

			const result = await getImages(logger);
			expect(result).toHaveLength(0);
		});
	});

	describe('getImageById', () => {
		it('returns image by id', async () => {
			const created = await createImage(baseImageData, testUserId, logger);

			const result = await getImageById(created.id, logger);
			expect(result.id).toBe(created.id);
			expect(result.name).toBe('grandmas-corn-chowder');
		});

		it('returns correct image when multiple exist', async () => {
			await createImage({ ...baseImageData, name: 'image-one' }, testUserId, logger);
			const target = await createImage({ ...baseImageData, name: 'image-two' }, testUserId, logger);

			const result = await getImageById(target.id, logger);
			expect(result.id).toBe(target.id);
			expect(result.name).toBe('image-two');
		});

		it('throws when image does not exist', async () => {
			await expect(getImageById(crypto.randomUUID(), logger)).rejects.toThrow('Expected 1 Image record(s), but found 0');
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(getImageById('not-a-uuid', logger)).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a Image');
		});

		it('throws when id is an empty string', async () => {
			await expect(getImageById('', logger)).rejects.toThrow('The value "" is not a valid ID for a Image');
		});
	});

	describe('createImage', () => {
		it('creates an image with required fields', async () => {
			const result = await createImage(baseImageData, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.name).toBe('grandmas-corn-chowder');
			expect(result.originalFilename).toBe('corn-chowder.jpg');
			expect(result.mimeType).toBe('image/jpeg');
			expect(result.fileSize).toBe(204800);
			expect(result.imageTypeId).toBe(imageTypeId);
		});

		it('sets createdBy to actingUserId', async () => {
			const result = await createImage(baseImageData, testUserId, logger);
			expect(result.createdBy).toBe(testUserId);
		});

		it('sets audit fields correctly', async () => {
			const result = await createImage(baseImageData, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates image with optional width and height', async () => {
			const result = await createImage({ ...baseImageData, width: 1500, height: 1125 }, testUserId, logger);

			expect(result.width).toBe(1500);
			expect(result.height).toBe(1125);
		});

		it('creates image with optional description', async () => {
			const result = await createImage({ ...baseImageData, description: 'A bowl of corn chowder' }, testUserId, logger);
			expect(result.description).toBe('A bowl of corn chowder');
		});

		it('defaults optional fields to null when not provided', async () => {
			const result = await createImage(baseImageData, testUserId, logger);

			expect(result.width).toBeNull();
			expect(result.height).toBeNull();
			expect(result.description).toBeNull();
		});

		it('creates multiple images with unique ids', async () => {
			const image1 = await createImage({ ...baseImageData, name: 'image-one' }, testUserId, logger);
			const image2 = await createImage({ ...baseImageData, name: 'image-two' }, testUserId, logger);

			expect(image1.id).not.toBe(image2.id);
		});

		it('id serves as the R2 key — is a valid uuid', async () => {
			const result = await createImage(baseImageData, testUserId, logger);
			expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
		});
	});

	describe('updateImage', () => {
		it('updates image fields', async () => {
			const created = await createImage(baseImageData, testUserId, logger);

			const result = await updateImage(
				created.id,
				{ ...baseImageData, name: 'updated-name', fileSize: 512000 },
				testUserId,
				logger,
			);

			expect(result.name).toBe('updated-name');
			expect(result.fileSize).toBe(512000);
		});

		it('sets updatedBy to actingUserId', async () => {
			const created = await createImage(baseImageData, testUserId, logger);

			const result = await updateImage(created.id, baseImageData, testUserId, logger);
			expect(result.updatedBy).toBe(testUserId);
		});

		it('sets updatedAt on update', async () => {
			const created = await createImage(baseImageData, testUserId, logger);
			expect(created.updatedAt).toBeNull();

			const result = await updateImage(created.id, baseImageData, testUserId, logger);
			expect(result.updatedAt).not.toBeNull();
		});

		it('throws when image does not exist', async () => {
			await expect(updateImage(crypto.randomUUID(), baseImageData, testUserId, logger)).rejects.toThrow(
				'Expected 1 Image record(s), but found 0',
			);
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(updateImage('not-a-uuid', baseImageData, testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Image',
			);
		});
	});

	describe('deleteImage', () => {
		it('soft-deletes the image and returns it with deletedAt set', async () => {
			const created = await createImage(baseImageData, testUserId, logger);

			const deleted = await deleteImage(created.id, testUserId, logger);

			expect(deleted.id).toBe(created.id);
			expect(deleted.deletedAt).not.toBeNull();
			expect(deleted.deletedBy).toBe(testUserId);
		});

		it('does not return deleted image from getImages', async () => {
			const created = await createImage(baseImageData, testUserId, logger);
			await deleteImage(created.id, testUserId, logger);

			const result = await getImages(logger);
			expect(result).toHaveLength(0);
		});

		it('throws when image does not exist', async () => {
			await expect(deleteImage(crypto.randomUUID(), testUserId, logger)).rejects.toThrow(
				'Expected 1 Image record(s), but found 0',
			);
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(deleteImage('not-a-uuid', testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Image',
			);
		});
	});
});
