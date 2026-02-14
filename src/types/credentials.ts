import type { credentials } from '@/models/schema';

export type Credential = typeof credentials.$inferSelect;
export type CredentialInsert = typeof credentials.$inferInsert;
