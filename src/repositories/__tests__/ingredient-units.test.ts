import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { ingredientUnits } from '@/models';
import { createUser } from '@/repositories';
import db, { resetDb } from '../../../tests/mocks/db';
import { getUnits } from '../ingredient-units';

const logger = new Logger();

describe('ingredient-units repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', logger);
		testUserId = user.id;
	});

	describe('getUnits', () => {
		it('returns empty array when no units exist', async () => {
			const result = await getUnits(logger);
			expect(result).toEqual([]);
		});

		it('returns all units', async () => {
			await db.insert(ingredientUnits).values([
				{ name: 'Cup', abbreviation: 'c', type: 'volume', createdBy: testUserId },
				{ name: 'Tablespoon', abbreviation: 'tbsp', type: 'volume', createdBy: testUserId },
				{ name: 'Gram', abbreviation: 'g', type: 'weight', createdBy: testUserId },
			]);

			const result = await getUnits(logger);
			expect(result).toHaveLength(3);
		});

		it('returns units with correct shape', async () => {
			await db.insert(ingredientUnits).values({ name: 'Cup', abbreviation: 'c', type: 'volume', createdBy: testUserId });

			const result = await getUnits(logger);
			expect(result[0]).toMatchObject({
				name: 'Cup',
				abbreviation: 'c',
				type: 'volume',
				createdBy: testUserId,
			});
			expect(result[0].id).toBeDefined();
		});

		it('returns units of different types', async () => {
			await db.insert(ingredientUnits).values([
				{ name: 'Cup', abbreviation: 'c', type: 'volume', createdBy: testUserId },
				{ name: 'Gram', abbreviation: 'g', type: 'weight', createdBy: testUserId },
				{ name: 'Piece', abbreviation: 'pc', type: 'count', createdBy: testUserId },
			]);

			const result = await getUnits(logger);
			const types = result.map(u => u.type);
			expect(types).toContain('volume');
			expect(types).toContain('weight');
			expect(types).toContain('count');
		});
	});
});
