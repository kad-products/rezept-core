import crypto from 'crypto';
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import { users } from './users';
import { recipes } from './recipes';
import { recipeIngredients } from './recipe-ingredients';
import { recipeInstructions } from './recipe-instructions';

export const recipeSections = sqliteTable('recipe_sections', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  recipeId: text()
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  title: text(), // nullable for simple recipes
  order: integer().notNull(),
  createdAt: text().notNull().$defaultFn(() => new Date().toISOString()),
  createdBy: text()
    .notNull()
    .references(() => users.id),
  updatedAt: text().$defaultFn(() => new Date().toISOString()),
  updatedBy: text().references(() => users.id),
  deletedAt: text(),
  deletedBy: text().references(() => users.id),
}, (table) => [
  index('recipe_sections_recipe_id_idx').on(table.recipeId),
  index('recipe_sections_recipe_id_order_idx').on(table.recipeId, table.order),
  uniqueIndex('recipe_sections_recipe_id_order_unique').on(table.recipeId, table.order),
]);

export const recipeSectionsRelations = relations(recipeSections, ({ one, many }) => ({
  recipe: one(recipes, {
    fields: [recipeSections.recipeId],
    references: [recipes.id],
  }),
  ingredients: many(recipeIngredients),
  instructions: many(recipeInstructions),
  creator: one(users, {
    fields: [recipeSections.createdBy],
    references: [users.id],
    relationName: 'sectionCreator',
  }),
}));

export type RecipeSection = typeof recipeSections.$inferSelect;
export type RecipeSectionInsert = typeof recipeSections.$inferInsert;