import crypto from 'crypto';
import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { users } from './users';
import { listItems } from './list-items';

export const lists = sqliteTable('lists', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  createdAt: text().notNull().$defaultFn(() => new Date().toISOString()),
  createdBy: text()
    .notNull()
    .references(() => users.id),
  updatedAt: text().$defaultFn(() => new Date().toISOString()),
  updatedBy: text().references(() => users.id),
  deletedAt: text(),
  deletedBy: text().references(() => users.id),
}, (table) => [
  index('lists_user_id_idx').on(table.userId),
]);

export const listsRelations = relations(lists, ({ one, many }) => ({
  user: one(users, {
    fields: [lists.userId],
    references: [users.id],
    relationName: 'listOwner',
  }),
  items: many(listItems),
  creator: one(users, {
    fields: [lists.createdBy],
    references: [users.id],
    relationName: 'listCreator',
  }),
}));

export type List = typeof lists.$inferSelect;
export type ListInsert = typeof lists.$inferInsert;