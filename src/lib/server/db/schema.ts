import { relations, sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clusters = sqliteTable('clusters', {
	id: integer('id').primaryKey().notNull(),
	clusterUuid: text('cluster_uuid').notNull(),
	name: text('name').notNull(),
	indexUrl: text('index_url').notNull(),
	queryUrl: text('query_url').notNull(),
	centerLat: real('center_lat').default(46.603354).notNull(),
	centerLon: real('center_lon').default(1.888334).notNull(),
	scale: integer('scale').default(5).notNull(),
	lastUpdated: integer('last_updated', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`),
	createdAt: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const nodes = sqliteTable('nodes', {
	id: integer('id').primaryKey().notNull(),
	clusterUuid: text('cluster_uuid').notNull(),
	profileUrl: text('profile_url').notNull(),
	data: text('data').notNull(),
	status: text('status').notNull().default('ignore'),
	isAvailable: integer('is_available').notNull().default(0),
	unavailableMessage: text('unavailable_message').default(''),
	hasAuthority: integer('has_authority').notNull().default(1),
	lastUpdated: integer('last_updated', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`),
	createdAt: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Table for users
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').unique().notNull(),
	normalizedName: text('normalized_name').unique().notNull(),
	emailReset: integer('email_reset', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const publicKeys = sqliteTable('public_keys', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	publicKey: text('public_key').unique().notNull(),
	createdAt: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const emails = sqliteTable('emails', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	email: text('email').unique().notNull(),
	createdAt: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const loginTokens = sqliteTable('login_tokens', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	token: text('token').unique().notNull(),
	expiresAt: integer('expires_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`),
	createdAt: integer('created_at', { mode: 'number' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const usersRelations = relations(users, ({ many }) => ({
	publicKeys: many(publicKeys),
	emails: many(emails),
	loginTokens: many(loginTokens)
}));

export const publicKeysRelations = relations(publicKeys, ({ one }) => ({
	user: one(users, {
		fields: [publicKeys.userId],
		references: [users.id]
	})
}));

export const emailsRelations = relations(emails, ({ one }) => ({
	user: one(users, {
		fields: [emails.userId],
		references: [users.id]
	})
}));

export const loginTokensRelations = relations(loginTokens, ({ one }) => ({
	user: one(users, {
		fields: [loginTokens.userId],
		references: [users.id]
	})
}));
