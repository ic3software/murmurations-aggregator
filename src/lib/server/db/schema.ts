import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const clusters = sqliteTable('clusters', {
	id: integer('id').primaryKey().notNull(),
	name: text('name').notNull(),
	indexUrl: text('index_url').notNull(),
	queryUrl: text('query_url').notNull(),
	tagSlug: text('tag_slug').notNull().unique(),
	mapCenterLat: real('map_center_lat').default(46.603354).notNull(),
	mapCenterLon: real('map_center_lon').default(1.888334).notNull(),
	mapScale: integer('map_scale').default(5).notNull(),
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
