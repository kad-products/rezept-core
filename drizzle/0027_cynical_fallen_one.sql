-- Normalize existing source values: strip protocol (https:// or http://) and trailing slashes.
-- First delete any duplicates that would collide after normalization, keeping the most recently created row.
DELETE FROM recipes
WHERE source IS NOT NULL
  AND id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY
          RTRIM(
            CASE
              WHEN source LIKE 'https://%' THEN SUBSTR(source, 9)
              WHEN source LIKE 'http://%'  THEN SUBSTR(source, 8)
              ELSE source
            END,
            '/'
          )
        ORDER BY created_at DESC
      ) AS rn
      FROM recipes
      WHERE source IS NOT NULL
    ) ranked
    WHERE rn = 1
  );--> statement-breakpoint

-- Apply normalization to all remaining rows.
UPDATE recipes
SET source =
  RTRIM(
    CASE
      WHEN source LIKE 'https://%' THEN SUBSTR(source, 9)
      WHEN source LIKE 'http://%'  THEN SUBSTR(source, 8)
      ELSE source
    END,
    '/'
  )
WHERE source IS NOT NULL;--> statement-breakpoint


CREATE TABLE `ingredient_seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`ingredient_id` text NOT NULL,
	`country` text NOT NULL,
	`region` text,
	`start_month` integer NOT NULL,
	`end_month` integer NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ingredient_seasons_ingredient_id_idx` ON `ingredient_seasons` (`ingredient_id`);--> statement-breakpoint
CREATE INDEX `ingredient_seasons_country_idx` ON `ingredient_seasons` (`country`);--> statement-breakpoint
CREATE INDEX `ingredient_seasons_region_idx` ON `ingredient_seasons` (`region`);--> statement-breakpoint
CREATE INDEX `ingredient_seasons_country_region_idx` ON `ingredient_seasons` (`country`,`region`);--> statement-breakpoint
CREATE UNIQUE INDEX `ingredient_seasons_ingredient_id_country_region_unique` ON `ingredient_seasons` (`ingredient_id`,`country`,`region`);