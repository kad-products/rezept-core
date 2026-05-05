DROP INDEX `recipe_instructions_recipe_section_id_step_number_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_instructions_recipe_section_id_step_number_unique` ON `recipe_instructions` (`recipe_section_id`,`step_number`) WHERE "deleted_at" IS NULL;--> statement-breakpoint
DROP INDEX `recipe_sections_recipe_id_order_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_sections_recipe_id_order_unique` ON `recipe_sections` (`recipe_id`,`order`) WHERE "deleted_at" IS NULL;