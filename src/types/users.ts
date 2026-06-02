import type { z } from 'zod';
import type { users } from '@/models';
import type { usersSchemas } from '@/schemas';

export type UserDBRead = typeof users.$inferSelect;
export type UserWriteInput = Omit<
	typeof users.$inferInsert,
	'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type UserAdminEditInput = z.input<typeof usersSchemas.adminEdit>;
