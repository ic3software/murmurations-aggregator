CREATE TABLE `clusters` (
	`id` integer PRIMARY KEY NOT NULL,
	`cluster_uuid` text NOT NULL,
	`name` text NOT NULL,
	`index_url` text NOT NULL,
	`query_url` text NOT NULL,
	`center_lat` real DEFAULT 46.603354 NOT NULL,
	`center_lon` real DEFAULT 1.888334 NOT NULL,
	`scale` integer DEFAULT 5 NOT NULL,
	`last_updated` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nodes` (
	`id` integer PRIMARY KEY NOT NULL,
	`cluster_uuid` text NOT NULL,
	`profile_url` text NOT NULL,
	`data` text NOT NULL,
	`status` text DEFAULT 'ignore' NOT NULL,
	`is_available` integer DEFAULT 0 NOT NULL,
	`unavailable_message` text DEFAULT '',
	`has_authority` integer DEFAULT 1 NOT NULL,
	`last_updated` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
