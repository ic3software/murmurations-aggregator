CREATE TABLE `clusters` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`index_url` text NOT NULL,
	`query_url` text NOT NULL,
	`tag_slug` text NOT NULL,
	`map_center_lat` real DEFAULT 46.603354 NOT NULL,
	`map_center_lon` real DEFAULT 1.888334 NOT NULL,
	`map_scale` integer DEFAULT 5 NOT NULL,
	`last_updated` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clusters_tag_slug_unique` ON `clusters` (`tag_slug`);