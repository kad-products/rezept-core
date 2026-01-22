import crypto from 'crypto';
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from 'drizzle-orm';
import { credentials } from './credentials';

export const users = sqliteTable('users', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text().notNull().unique(),
  createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
  updatedAt: text().$defaultFn(() => new Date().toISOString()),
});

export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(credentials),
}));

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
