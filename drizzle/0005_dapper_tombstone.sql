ALTER TABLE `recipe_ingredient_units` RENAME TO `ingredient_units`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ingredient_units` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`abbreviation` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ingredient_units`("id", "name", "abbreviation", "type", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "name", "abbreviation", "type", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `ingredient_units`;--> statement-breakpoint
DROP TABLE `ingredient_units`;--> statement-breakpoint
ALTER TABLE `__new_ingredient_units` RENAME TO `ingredient_units`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`quantity` real,
	`unit_id` text,
	`status` text DEFAULT 'NEEDED' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `ingredient_units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_list_items`("id", "list_id", "ingredient_id", "quantity", "unit_id", "status", "notes", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "list_id", "ingredient_id", "quantity", "unit_id", "status", "notes", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `list_items`;--> statement-breakpoint
DROP TABLE `list_items`;--> statement-breakpoint
ALTER TABLE `__new_list_items` RENAME TO `list_items`;--> statement-breakpoint
CREATE INDEX `list_items_list_id_idx` ON `list_items` (`list_id`);--> statement-breakpoint
CREATE INDEX `list_items_ingredient_id_idx` ON `list_items` (`ingredient_id`);--> statement-breakpoint
CREATE TABLE `__new_recipe_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_section_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`quantity` real,
	`unit_id` text,
	`preparation` text,
	`modifier` text,
	`order` integer NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`recipe_section_id`) REFERENCES `recipe_sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `ingredient_units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_recipe_ingredients`("id", "recipe_section_id", "ingredient_id", "quantity", "unit_id", "preparation", "modifier", "order", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "recipe_section_id", "ingredient_id", "quantity", "unit_id", "preparation", "modifier", "order", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `recipe_ingredients`;--> statement-breakpoint
DROP TABLE `recipe_ingredients`;--> statement-breakpoint
ALTER TABLE `__new_recipe_ingredients` RENAME TO `recipe_ingredients`;--> statement-breakpoint
CREATE INDEX `recipe_ingredients_section_id_idx` ON `recipe_ingredients` (`recipe_section_id`);--> statement-breakpoint
CREATE INDEX `recipe_ingredients_ingredient_id_idx` ON `recipe_ingredients` (`ingredient_id`);--> statement-breakpoint
CREATE INDEX `recipe_ingredients_section_id_order_idx` ON `recipe_ingredients` (`recipe_section_id`,`order`);