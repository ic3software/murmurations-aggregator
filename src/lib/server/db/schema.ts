import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const clusters = sqliteTable('clusters', {
	id: integer('id').primaryKey().notNull(),
	clusterId: text('cluster_id').notNull(),
	name: text('name').notNull(),
	indexUrl: text('index_url').notNull(),
	queryUrl: text('query_url').notNull(),
	centerLat: real('center_lat').default(46.603354).notNull(),
	centerLon: real('center_lon').default(1.888334).notNull(),
	scale: integer('scale').default(5).notNull(),
	lastUpdated: integer('last_updated', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdAt: integer('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull()
});

export const nodes = sqliteTable('nodes', {
	id: integer('id').primaryKey().notNull(),
	clusterUuid: text('cluster_uuid').notNull(),
	profileUrl: text('profile_url').notNull(),
	data: text('data').notNull(),
	lastUpdated: integer('last_updated', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	status: text('status').notNull().default('ignore'),
	isAvailable: integer('is_available').notNull().default(0),
	unavailableMessage: text('unavailable_message').default(''),
	hasAuthority: integer('has_authority').notNull().default(1),
	createdAt: integer('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: integer('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull()
});
