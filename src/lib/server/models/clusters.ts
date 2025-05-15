import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { clusters } from '$lib/server/db/schema';
import type { DBCluster } from '$lib/types/cluster';

export async function getClusters(db: DrizzleD1Database) {
	return await db.select().from(clusters).all();
}

export async function createCluster(db: DrizzleD1Database, cluster: DBCluster) {
	return await db.insert(clusters).values(cluster).run();
}
