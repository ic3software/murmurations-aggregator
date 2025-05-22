import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { nodes } from '$lib/server/db/schema';
import type { D1Result } from '@cloudflare/workers-types';
import type { NodeDbCreateInput } from '$lib/types/node';
import { and, eq } from 'drizzle-orm';

export async function getNodes(db: DrizzleD1Database, clusterId: string) {
	return await db.select().from(nodes).where(eq(nodes.clusterUuid, clusterId)).all();
}

export async function createNode(
	db: DrizzleD1Database,
	node: NodeDbCreateInput
): Promise<D1Result> {
	return await db.insert(nodes).values(node).run();
}

export async function updateNodeStatus(
	db: DrizzleD1Database,
	clusterId: string,
	nodeId: number,
	status: string
): Promise<D1Result> {
	return await db
		.update(nodes)
		.set({ status })
		.where(and(eq(nodes.clusterUuid, clusterId), eq(nodes.id, nodeId)))
		.run();
}

export async function deleteNodes(db: DrizzleD1Database, clusterId: string): Promise<D1Result> {
	return await db.delete(nodes).where(eq(nodes.clusterUuid, clusterId)).run();
}
