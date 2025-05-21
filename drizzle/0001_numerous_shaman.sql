CREATE TABLE `nodes` (
	`id` integer PRIMARY KEY NOT NULL,
	`cluster_id` integer NOT NULL,
	`post_id` integer,
	`profile_url` text NOT NULL,
	`data` text NOT NULL,
	`last_updated` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`status` text DEFAULT 'ignore' NOT NULL,
	`is_available` integer DEFAULT 0 NOT NULL,
	`unavailable_message` text DEFAULT '',
	`has_authority` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
