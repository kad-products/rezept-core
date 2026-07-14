import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createGrowingZone, deleteGrowingZone, getGrowingZoneById, getGrowingZones, updateGrowingZone } from '../growing-zones';

const logger = createNoopLogger();

const VALID_ZONE = { code: 'us_pacific_coast', name: 'US Pacific Coast' };

describe('growing zones repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
	});

	describe('getGrowingZones', () => {
		it('returns empty array when no zones exist', async () => {
			const result = await getGrowingZones(logger);
			expect(result).toEqual([]);
		});

		it('returns all growing zones', async () => {
			await createGrowingZone(VALID_ZONE, testUserId, logger);
			await createGrowingZone({ code: 'mediterranean', name: 'Mediterranean' }, testUserId, logger);

			const result = await getGrowingZones(logger);
			expect(result).toHaveLength(2);
		});

		it('returns zones with correct shape', async () => {
			await createGrowingZone(VALID_ZONE, testUserId, logger);

			const result = await getGrowingZones(logger);
			expect(result[0]).toMatchObject({ code: 'us_pacific_coast', name: 'US Pacific Coast', createdBy: testUserId });
			expect(result[0].id).toBeDefined();
		});

		it('does not return soft-deleted zones', async () => {
			const deleted = await createGrowingZone(VALID_ZONE, testUserId, logger);
			const visible = await createGrowingZone({ code: 'mediterranean', name: 'Mediterranean' }, testUserId, logger);

			await deleteGrowingZone(deleted.id, testUserId, logger);

			const result = await getGrowingZones(logger);
			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(visible.id);
		});
	});

	describe('getGrowingZoneById', () => {
		it('returns zone by id', async () => {
			const created = await createGrowingZone(VALID_ZONE, testUserId, logger);

			const result = await getGrowingZoneById(created.id, logger);
			expect(result.id).toBe(created.id);
			expect(result.code).toBe('us_pacific_coast');
		});

		it('throws when zone does not exist', async () => {
			await expect(getGrowingZoneById(randomUUID(), logger)).rejects.toThrow('Expected 1 Growing Zone record(s), but found 0');
		});

		it('throws when id is not a valid UUID', async () => {
			await expect(getGrowingZoneById('not-a-uuid', logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Growing Zone',
			);
		});

		it('throws when id is an empty string', async () => {
			await expect(getGrowingZoneById('', logger)).rejects.toThrow('The value "" is not a valid ID for a Growing Zone');
		});

		it('returns the correct zone when multiple exist', async () => {
			await createGrowingZone(VALID_ZONE, testUserId, logger);
			const target = await createGrowingZone({ code: 'mediterranean', name: 'Mediterranean' }, testUserId, logger);

			const result = await getGrowingZoneById(target.id, logger);
			expect(result.id).toBe(target.id);
			expect(result.code).toBe('mediterranean');
		});

		it('does not return soft-deleted zones', async () => {
			const zone = await createGrowingZone(VALID_ZONE, testUserId, logger);
			await deleteGrowingZone(zone.id, testUserId, logger);

			await expect(getGrowingZoneById(zone.id, logger)).rejects.toThrow('Expected 1 Growing Zone record(s), but found 0');
		});
	});

	describe('createGrowingZone', () => {
		it('creates a zone with required fields', async () => {
			const result = await createGrowingZone(VALID_ZONE, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.code).toBe('us_pacific_coast');
			expect(result.name).toBe('US Pacific Coast');
		});

		it('sets createdBy to userId', async () => {
			const result = await createGrowingZone(VALID_ZONE, testUserId, logger);
			expect(result.createdBy).toBe(testUserId);
		});

		it('sets audit fields correctly', async () => {
			const result = await createGrowingZone(VALID_ZONE, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates multiple zones with unique ids', async () => {
			const zone1 = await createGrowingZone(VALID_ZONE, testUserId, logger);
			const zone2 = await createGrowingZone({ code: 'mediterranean', name: 'Mediterranean' }, testUserId, logger);

			expect(zone1.id).not.toBe(zone2.id);
		});

		it('throws on duplicate code', async () => {
			await createGrowingZone(VALID_ZONE, testUserId, logger);
			await expect(createGrowingZone(VALID_ZONE, testUserId, logger)).rejects.toThrow();
		});
	});

	describe('deleteGrowingZone', () => {
		it('soft-deletes the zone and returns it with deletedAt set', async () => {
			const zone = await createGrowingZone(VALID_ZONE, testUserId, logger);
			const deleted = await deleteGrowingZone(zone.id, testUserId, logger);

			expect(deleted.deletedAt).not.toBeNull();
			expect(deleted.deletedBy).toBe(testUserId);
		});

		it('excludes the zone from subsequent queries', async () => {
			const zone = await createGrowingZone(VALID_ZONE, testUserId, logger);
			await deleteGrowingZone(zone.id, testUserId, logger);

			await expect(getGrowingZoneById(zone.id, logger)).rejects.toThrow();
		});

		it('throws when id is not a valid UUID', async () => {
			await expect(deleteGrowingZone('not-a-uuid', testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Growing Zone',
			);
		});

		it('throws when zone does not exist', async () => {
			await expect(deleteGrowingZone(randomUUID(), testUserId, logger)).rejects.toThrow();
		});

		it('does not affect other zones', async () => {
			const target = await createGrowingZone(VALID_ZONE, testUserId, logger);
			const other = await createGrowingZone({ code: 'mediterranean', name: 'Mediterranean' }, testUserId, logger);

			await deleteGrowingZone(target.id, testUserId, logger);

			const unchanged = await getGrowingZoneById(other.id, logger);
			expect(unchanged.deletedAt).toBeNull();
		});
	});

	describe('updateGrowingZone', () => {
		it('updates the zone name', async () => {
			const created = await createGrowingZone(VALID_ZONE, testUserId, logger);

			const result = await updateGrowingZone(
				created.id,
				{ code: 'us_pacific_coast', name: 'US Pacific Coast (Updated)' },
				testUserId,
				logger,
			);

			expect(result.name).toBe('US Pacific Coast (Updated)');
		});

		it('updates the zone code', async () => {
			const created = await createGrowingZone(VALID_ZONE, testUserId, logger);

			const result = await updateGrowingZone(created.id, { code: 'us_west_coast', name: 'US Pacific Coast' }, testUserId, logger);

			expect(result.code).toBe('us_west_coast');
		});

		it('returns the updated zone', async () => {
			const created = await createGrowingZone(VALID_ZONE, testUserId, logger);

			const result = await updateGrowingZone(created.id, { code: 'us_west_coast', name: 'US West Coast' }, testUserId, logger);

			expect(result.id).toBe(created.id);
		});

		it('sets updatedBy to userId', async () => {
			const created = await createGrowingZone(VALID_ZONE, testUserId, logger);

			const result = await updateGrowingZone(created.id, { ...VALID_ZONE, name: 'Updated' }, testUserId, logger);

			expect(result.updatedBy).toBe(testUserId);
		});

		it('sets updatedAt on update', async () => {
			const created = await createGrowingZone(VALID_ZONE, testUserId, logger);

			const result = await updateGrowingZone(created.id, { ...VALID_ZONE, name: 'Updated' }, testUserId, logger);

			expect(result.updatedAt).not.toBeNull();
		});

		it('throws when id is not a valid UUID', async () => {
			await expect(updateGrowingZone('not-a-uuid', VALID_ZONE, testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Growing Zone',
			);
		});

		it('throws when zone does not exist', async () => {
			await expect(updateGrowingZone(randomUUID(), VALID_ZONE, testUserId, logger)).rejects.toThrow();
		});

		it('does not affect other zones', async () => {
			const other = await createGrowingZone({ code: 'mediterranean', name: 'Mediterranean' }, testUserId, logger);
			const target = await createGrowingZone(VALID_ZONE, testUserId, logger);

			await updateGrowingZone(target.id, { ...VALID_ZONE, name: 'Updated' }, testUserId, logger);

			const unchanged = await getGrowingZoneById(other.id, logger);
			expect(unchanged.name).toBe('Mediterranean');
			expect(unchanged.updatedAt).toBeNull();
		});
	});
});
