DROP INDEX `ingredient_seasons_country_idx`;--> statement-breakpoint
DROP INDEX `ingredient_seasons_region_idx`;--> statement-breakpoint
DROP INDEX `ingredient_seasons_country_region_idx`;--> statement-breakpoint
DROP INDEX `ingredient_seasons_ingredient_id_country_region_unique`;--> statement-breakpoint
ALTER TABLE `ingredient_seasons` ADD `growing_zone_id` text NOT NULL REFERENCES growing_zones(id);--> statement-breakpoint
CREATE INDEX `ingredient_seasons_growing_zone_id_idx` ON `ingredient_seasons` (`growing_zone_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ingredient_seasons_ingredient_id_growing_zone_id_unique` ON `ingredient_seasons` (`ingredient_id`,`growing_zone_id`) WHERE "deleted_at" IS NULL;--> statement-breakpoint
ALTER TABLE `ingredient_seasons` DROP COLUMN `country`;--> statement-breakpoint
ALTER TABLE `ingredient_seasons` DROP COLUMN `region`;