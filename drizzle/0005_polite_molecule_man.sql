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
  ('api', '/clusters', 'clusters', 'POST'),
  ('api', '/clusters/*/nodes', 'clusters', 'POST'),
  ('api', '/clusters/*/nodes/*', 'clusters', 'PUT'),
  ('api', '/clusters/*/nodes/*/status', 'clusters', 'PUT'),
  ('api', '/clusters/*/update-timestamp', 'clusters', 'PATCH'),

  ('api', '/emails', 'emails', 'GET'),
  ('api', '/emails', 'emails', 'POST'),
  ('api', '/emails', 'emails', 'DELETE'),
  ('api', '/emails/send-reset-request', 'emails', 'POST'),

  ('api', '/keys', 'keys', 'GET'),
  ('api', '/keys', 'keys', 'POST'),

  ('api', '/profiles', 'profiles', 'GET'),
  ('api', '/profiles', 'profiles', 'POST'),
  ('api', '/profiles/*', 'profiles', 'GET'),
  ('api', '/profiles/*', 'profiles', 'PATCH'),
  ('api', '/profiles/*', 'profiles', 'DELETE'),
  ('api', '/profiles/*/update-node-id', 'profiles', 'PUT'),

  ('api', '/source-indexes', 'source-indexes', 'POST'),
  ('api', '/source-indexes/*', 'source-indexes', 'PUT'),
  ('api', '/source-indexes/*', 'source-indexes', 'DELETE'),

  ('api', '/tokens', 'tokens', 'GET'),
  ('api', '/tokens', 'tokens', 'POST'),
  ('api', '/tokens', 'tokens', 'DELETE'),

  ('api', '/users', 'users', 'GET'),
  ('api', '/users/email-reset', 'users', 'PATCH');
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
