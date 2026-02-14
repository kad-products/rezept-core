import type { users } from '@/models/schema';

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
