CREATE TABLE `image_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
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
CREATE UNIQUE INDEX `image_types_name_unique` ON `image_types` (`name`);--> statement-breakpoint
CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`image_type_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`original_filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`image_type_id`) REFERENCES `image_types`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `images_image_type_id_idx` ON `images` (`image_type_id`);--> statement-breakpoint
ALTER TABLE `recipes` ADD `cover_image_id` text REFERENCES images(id);--> statement-breakpoint
-- Seed required image types
INSERT INTO `image_types` (`id`, `name`, `created_at`, `created_by`) VALUES
	('a1b2c3d4-0001-0000-0000-000000000001', 'RECIPE_COVER_IMAGE', '2026-05-25T00:00:00.000Z', '0db3ae20-e4e2-4829-bbe5-52298f0af865');