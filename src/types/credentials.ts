import type { credentials } from '@/models';

export type CredentialDBRead = typeof credentials.$inferSelect;
export type CredentialDBWrite = Omit<
	typeof credentials.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
