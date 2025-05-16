import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { clusters } from '$lib/server/db/schema';
import type { DBCluster, EditableClusterFields } from '$lib/types/cluster';
import { eq } from 'drizzle-orm';
import type { D1Result } from '@cloudflare/workers-types';

export async function getClusters(db: DrizzleD1Database) {
	return await db.select().from(clusters).all();
}

export async function getCluster(db: DrizzleD1Database, clusterId: string) {
	return await db.select().from(clusters).where(eq(clusters.clusterId, clusterId)).get();
}

export async function createCluster(db: DrizzleD1Database, cluster: DBCluster) {
	return await db.insert(clusters).values(cluster).run();
}

export async function updateCluster(
	db: DrizzleD1Database,
	clusterId: string,
	cluster: EditableClusterFields
) {
	return await db.update(clusters).set(cluster).where(eq(clusters.clusterId, clusterId)).run();
}

export async function deleteCluster(db: DrizzleD1Database, clusterId: string): Promise<D1Result> {
	return await db.delete(clusters).where(eq(clusters.clusterId, clusterId)).run();
}
