import crypto from 'crypto';
import { sqliteTable, text, integer, blob, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from 'drizzle-orm';

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

export const credentials = sqliteTable("credentials", {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: text().notNull().default(sql`(datetime('now', 'localtime'))`),
  updatedAt: text().$defaultFn(() => new Date().toISOString()),
  credentialId: text().notNull().unique(),
  publicKey: blob().$type<Uint8Array>().notNull(),
  counter: integer().notNull().default(0),
  name: text(),
  lastUsedAt: text(),
}, (table) => [
  index("credentials_user_id_idx").on(table.userId),
  index("credentials_credential_id_idx").on(table.credentialId),
  index("credentials_user_credential_idx").on(table.userId, table.credentialId),
]);

export const credentialsRelations = relations(credentials, ({ one }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id],
  }),
}));

export type Credential = typeof credentials.$inferSelect;
export type CredentialInsert = typeof credentials.$inferInsert;