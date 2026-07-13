DROP INDEX `ingredient_seasons_ingredient_id_country_region_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `ingredient_seasons_ingredient_id_country_region_unique` ON `ingredient_seasons` (`ingredient_id`,`country`,`region`) WHERE "deleted_at" IS NULL;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `new_role` text NOT NULL DEFAULT 'BASIC';--> statement-breakpoint
UPDATE `users` SET `new_role` = `role` WHERE `role` IS NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `role`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `new_role` TO `role`;
