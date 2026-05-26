import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import {
	createImageType,
	deleteImageType,
	getImageTypeById,
	getImageTypeByName,
	getImageTypes,
	updateImageType,
} from '../image-types';

const logger = new Logger();

describe('image-types repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
	});

	describe('getImageTypes', () => {
		it('returns seeded image types', async () => {
			const result = await getImageTypes(logger);
			expect(result.some(t => t.name === 'RECIPE_COVER_IMAGE')).toBe(true);
		});

		it('returns newly created image types', async () => {
			await createImageType({ name: 'USER_AVATAR' }, testUserId, logger);

			const result = await getImageTypes(logger);
			expect(result.some(t => t.name === 'USER_AVATAR')).toBe(true);
		});

		it('does not return deleted image types', async () => {
			const created = await createImageType({ name: 'TO_DELETE' }, testUserId, logger);
			await deleteImageType(created.id, testUserId, logger);

			const result = await getImageTypes(logger);
			expect(result.some(t => t.name === 'TO_DELETE')).toBe(false);
		});
	});

	describe('getImageTypeById', () => {
		it('returns image type by id', async () => {
			const created = await createImageType({ name: 'USER_AVATAR' }, testUserId, logger);

			const result = await getImageTypeById(created.id, logger);
			expect(result.id).toBe(created.id);
			expect(result.name).toBe('USER_AVATAR');
		});

		it('throws when image type does not exist', async () => {
			await expect(getImageTypeById(crypto.randomUUID(), logger)).rejects.toThrow('Expected 1 ImageType record(s), but found 0');
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(getImageTypeById('not-a-uuid', logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a ImageType',
			);
		});

		it('throws when id is an empty string', async () => {
			await expect(getImageTypeById('', logger)).rejects.toThrow('The value "" is not a valid ID for a ImageType');
		});
	});

	describe('getImageTypeByName', () => {
		it('returns image type by name', async () => {
			const result = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
			expect(result.name).toBe('RECIPE_COVER_IMAGE');
		});

		it('returns newly created image type by name', async () => {
			await createImageType({ name: 'USER_AVATAR' }, testUserId, logger);

			const result = await getImageTypeByName('USER_AVATAR', logger);
			expect(result.name).toBe('USER_AVATAR');
		});

		it('throws when name does not exist', async () => {
			await expect(getImageTypeByName('NONEXISTENT', logger)).rejects.toThrow('Expected 1 ImageType record(s), but found 0');
		});

		it('throws after the named type is deleted', async () => {
			const created = await createImageType({ name: 'TEMP_TYPE' }, testUserId, logger);
			await deleteImageType(created.id, testUserId, logger);

			await expect(getImageTypeByName('TEMP_TYPE', logger)).rejects.toThrow('Expected 1 ImageType record(s), but found 0');
		});
	});

	describe('createImageType', () => {
		it('creates an image type with required fields', async () => {
			const result = await createImageType({ name: 'USER_AVATAR' }, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.name).toBe('USER_AVATAR');
		});

		it('sets createdBy to actingUserId', async () => {
			const result = await createImageType({ name: 'USER_AVATAR' }, testUserId, logger);
			expect(result.createdBy).toBe(testUserId);
		});

		it('sets audit fields correctly', async () => {
			const result = await createImageType({ name: 'USER_AVATAR' }, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates multiple image types with unique ids', async () => {
			const type1 = await createImageType({ name: 'TYPE_A' }, testUserId, logger);
			const type2 = await createImageType({ name: 'TYPE_B' }, testUserId, logger);

			expect(type1.id).not.toBe(type2.id);
		});

		it('throws on duplicate name', async () => {
			await createImageType({ name: 'DUPLICATE' }, testUserId, logger);
			await expect(createImageType({ name: 'DUPLICATE' }, testUserId, logger)).rejects.toThrow();
		});
	});

	describe('updateImageType', () => {
		it('updates image type name', async () => {
			const created = await createImageType({ name: 'OLD_NAME' }, testUserId, logger);

			const result = await updateImageType(created.id, { name: 'NEW_NAME' }, testUserId, logger);
			expect(result.name).toBe('NEW_NAME');
		});

		it('sets updatedBy to actingUserId', async () => {
			const created = await createImageType({ name: 'USER_AVATAR' }, testUserId, logger);

			const result = await updateImageType(created.id, { name: 'USER_AVATAR' }, testUserId, logger);
			expect(result.updatedBy).toBe(testUserId);
		});

		it('sets updatedAt on update', async () => {
			const created = await createImageType({ name: 'USER_AVATAR' }, testUserId, logger);
			expect(created.updatedAt).toBeNull();

			const result = await updateImageType(created.id, { name: 'USER_AVATAR' }, testUserId, logger);
			expect(result.updatedAt).not.toBeNull();
		});

		it('throws when image type does not exist', async () => {
			await expect(updateImageType(crypto.randomUUID(), { name: 'ANY' }, testUserId, logger)).rejects.toThrow(
				'Expected 1 ImageType record(s), but found 0',
			);
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(updateImageType('not-a-uuid', { name: 'ANY' }, testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a ImageType',
			);
		});
	});

	describe('deleteImageType', () => {
		it('soft-deletes the image type and returns it with deletedAt set', async () => {
			const created = await createImageType({ name: 'TO_DELETE' }, testUserId, logger);

			const deleted = await deleteImageType(created.id, testUserId, logger);

			expect(deleted.id).toBe(created.id);
			expect(deleted.deletedAt).not.toBeNull();
			expect(deleted.deletedBy).toBe(testUserId);
		});

		it('does not return deleted image type from getImageTypes', async () => {
			const created = await createImageType({ name: 'TO_DELETE' }, testUserId, logger);
			await deleteImageType(created.id, testUserId, logger);

			const result = await getImageTypes(logger);
			expect(result.some(t => t.id === created.id)).toBe(false);
		});

		it('throws when image type does not exist', async () => {
			await expect(deleteImageType(crypto.randomUUID(), testUserId, logger)).rejects.toThrow(
				'Expected 1 ImageType record(s), but found 0',
			);
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(deleteImageType('not-a-uuid', testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a ImageType',
			);
		});
	});
});
