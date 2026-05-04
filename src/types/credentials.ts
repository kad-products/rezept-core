import type { credentials } from '@/models';

export type CredentialDBRead = typeof credentials.$inferSelect;
export type CredentialWriteInput = Omit<
	typeof credentials.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
