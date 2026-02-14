import type { users } from '@/models';

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
