import { clusters } from '$lib/server/db/schema';
import type { ClusterDbUpdateInput, ClusterInsert } from '$lib/types/cluster';
import type { D1Result } from '@cloudflare/workers-types';
import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getClusters(db: DrizzleD1Database) {
	return await db.select().from(clusters).all();
}

export async function getCluster(db: DrizzleD1Database, clusterId: string) {
	return await db.select().from(clusters).where(eq(clusters.clusterId, clusterId)).get();
}

export async function createCluster(db: DrizzleD1Database, cluster: ClusterInsert) {
	return await db.insert(clusters).values(cluster).run();
}

export async function updateCluster(
	db: DrizzleD1Database,
	clusterId: string,
	cluster: ClusterDbUpdateInput
) {
	return await db.update(clusters).set(cluster).where(eq(clusters.clusterId, clusterId)).run();
}

export async function deleteCluster(db: DrizzleD1Database, clusterId: string): Promise<D1Result> {
	return await db.delete(clusters).where(eq(clusters.clusterId, clusterId)).run();
}

export async function updateClusterTimestamp(
	db: DrizzleD1Database,
	clusterId: string,
	lastUpdated: number
) {
	return await db
		.update(clusters)
		.set({ lastUpdated })
		.where(eq(clusters.clusterId, clusterId))
		.run();
}
