import type { credentials } from '@/models';

export type CredentialDBRead = typeof credentials.$inferSelect;
export type CredentialDBWrite = typeof credentials.$inferInsert;
