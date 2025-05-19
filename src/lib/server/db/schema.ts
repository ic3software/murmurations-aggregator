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
