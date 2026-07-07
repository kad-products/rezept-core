CREATE TABLE `recipe_cooking_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_section_id` text NOT NULL,
	`name` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`recipe_section_id`) REFERENCES `recipe_sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recipe_cooking_methods_section_id_idx` ON `recipe_cooking_methods` (`recipe_section_id`);--> statement-breakpoint
CREATE INDEX `recipe_cooking_methods_section_id_name_idx` ON `recipe_cooking_methods` (`recipe_section_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_cooking_methods_recipe_section_id_name_unique` ON `recipe_cooking_methods` (`recipe_section_id`,`name`) WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX `recipe_cooking_methods_section_id_order_idx` ON `recipe_cooking_methods` (`recipe_section_id`,`order`);--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_cooking_methods_recipe_section_id_order_unique` ON `recipe_cooking_methods` (`recipe_section_id`,`order`) WHERE "deleted_at" IS NULL;--> statement-breakpoint
-- Create a "Standard" cooking method for every existing section so existing instructions remain associated
INSERT INTO `recipe_cooking_methods` (`id`, `recipe_section_id`, `name`, `order`, `created_at`, `created_by`)
SELECT
	lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
	`id`,
	'Standard',
	1,
	strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
	`created_by`
FROM `recipe_sections`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe_instructions` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_cooking_method_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`instruction` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`recipe_cooking_method_id`) REFERENCES `recipe_cooking_methods`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- Re-associate existing instructions with their section's new "Standard" cooking method
INSERT INTO `__new_recipe_instructions`("id", "recipe_cooking_method_id", "step_number", "instruction", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by")
SELECT ri."id", rcm."id", ri."step_number", ri."instruction", ri."created_at", ri."created_by", ri."updated_at", ri."updated_by", ri."deleted_at", ri."deleted_by"
FROM `recipe_instructions` ri
JOIN `recipe_cooking_methods` rcm ON rcm.`recipe_section_id` = ri.`recipe_section_id`;--> statement-breakpoint
DROP TABLE `recipe_instructions`;--> statement-breakpoint
ALTER TABLE `__new_recipe_instructions` RENAME TO `recipe_instructions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `recipe_instructions_cooking_method_id_idx` ON `recipe_instructions` (`recipe_cooking_method_id`);--> statement-breakpoint
CREATE INDEX `recipe_instructions_cooking_method_id_step_idx` ON `recipe_instructions` (`recipe_cooking_method_id`,`step_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_instructions_recipe_cooking_method_id_step_number_unique` ON `recipe_instructions` (`recipe_cooking_method_id`,`step_number`) WHERE "deleted_at" IS NULL;