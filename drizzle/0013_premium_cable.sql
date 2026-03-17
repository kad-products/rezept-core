PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_section_id` text NOT NULL,
	`raw` text,
	`ingredient_id` text,
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
INSERT INTO `__new_recipe_ingredients`("id", "recipe_section_id", "raw", "ingredient_id", "quantity", "unit_id", "preparation", "modifier", "order", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "recipe_section_id", "raw", "ingredient_id", "quantity", "unit_id", "preparation", "modifier", "order", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `recipe_ingredients`;--> statement-breakpoint
DROP TABLE `recipe_ingredients`;--> statement-breakpoint
ALTER TABLE `__new_recipe_ingredients` RENAME TO `recipe_ingredients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `recipe_ingredients_section_id_idx` ON `recipe_ingredients` (`recipe_section_id`);--> statement-breakpoint
CREATE INDEX `recipe_ingredients_ingredient_id_idx` ON `recipe_ingredients` (`ingredient_id`);--> statement-breakpoint
CREATE INDEX `recipe_ingredients_section_id_order_idx` ON `recipe_ingredients` (`recipe_section_id`,`order`);