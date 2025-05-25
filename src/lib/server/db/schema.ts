import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const clusters = sqliteTable('clusters', {
	id: integer('id').primaryKey().notNull(),
	clusterId: text('cluster_id').notNull(),
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
