CREATE TABLE `capabilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scheme` text NOT NULL,
	`hier_part` text NOT NULL,
	`namespace` text NOT NULL,
	`segments` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `delegations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_user_id` integer NOT NULL,
	`to_user_id` integer NOT NULL,
	`capability_id` integer NOT NULL,
	`expires_at` integer DEFAULT (unixepoch()) NOT NULL,
	`delegation_token` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`capability_id`) REFERENCES `capabilities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_capabilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer NOT NULL,
	`capability_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`capability_id`) REFERENCES `capabilities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `capabilities` (`scheme`, `hier_part`, `namespace`, `segments`)
VALUES
  ('api', '/users', 'user', 'GET'),
  ('api', '/users', 'user', 'POST'),
  ('api', '/users', 'user', 'PATCH'),
  ('api', '/users', 'user', 'DELETE'),
  ('api', '/emails', 'email', 'GET'),
  ('api', '/emails', 'email', 'POST'),
  ('api', '/emails', 'email', 'DELETE'),
  ('api', '/clusters', 'cluster', 'GET'),
  ('api', '/clusters', 'cluster', 'POST'),
  ('api', '/clusters', 'cluster', 'PATCH'),
  ('api', '/clusters', 'cluster', 'DELETE'),
  ('api', '/nodes', 'node', 'GET'),
  ('api', '/nodes', 'node', 'PATCH'),
  ('api', '/nodes', 'node', 'DELETE'),
  ('api', '/source-indexes', 'source-index', 'GET'),
  ('api', '/source-indexes', 'source-index', 'POST'),
  ('api', '/source-indexes', 'source-index', 'PATCH'),
  ('api', '/source-indexes', 'source-index', 'DELETE'),
  ('api', '/profiles', 'profile', 'GET'),
  ('api', '/profiles', 'profile', 'POST'),
  ('api', '/profiles', 'profile', 'PATCH'),
  ('api', '/profiles', 'profile', 'DELETE'),
  ('api', '/keys', 'key', 'GET'),
  ('api', '/keys', 'key', 'POST'),
  ('api', '/keys', 'key', 'DELETE'),
  ('api', '/login-tokens', 'login-token', 'GET'),
  ('api', '/login-tokens', 'login-token', 'POST'),
  ('api', '/login-tokens', 'login-token', 'DELETE');
--> statement-breakpoint
INSERT INTO `roles` (`name`, `description`)
VALUES
  ('root', 'Super admin user');
--> statement-breakpoint
INSERT INTO `role_capabilities` (`role_id`, `capability_id`)
SELECT 
  (SELECT id FROM roles WHERE name = 'root'),
  id
FROM capabilities;
--> statement-breakpoint
INSERT INTO `user_roles` (`user_id`, `role_id`)
VALUES
  ((SELECT id FROM users WHERE normalized_name = 'root'), (SELECT id FROM roles WHERE name = 'root'));
