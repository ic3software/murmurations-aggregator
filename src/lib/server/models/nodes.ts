import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { nodes } from '$lib/server/db/schema';
import type { D1Result } from '@cloudflare/workers-types';
import type { NodeInsert, NodeDbUpdateInput } from '$lib/types/node';
import { and, eq } from 'drizzle-orm';

export async function getNodes(db: DrizzleD1Database, clusterId: string) {
	return await db.select().from(nodes).where(eq(nodes.clusterUuid, clusterId)).all();
}

export async function createNode(db: DrizzleD1Database, node: NodeInsert): Promise<{ id: number }> {
	const result = await db.insert(nodes).values(node).returning({ id: nodes.id }).get();
	return { id: result.id };
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

export async function updateNode(
	db: DrizzleD1Database,
	clusterId: string,
	nodeId: number,
	node: NodeDbUpdateInput
): Promise<D1Result> {
	return await db
		.update(nodes)
		.set(node)
		.where(and(eq(nodes.clusterUuid, clusterId), eq(nodes.id, nodeId)))
		.returning()
		.run();
}

export async function deleteNodes(db: DrizzleD1Database, clusterId: string): Promise<D1Result> {
	return await db.delete(nodes).where(eq(nodes.clusterUuid, clusterId)).run();
}

export async function deleteNode(
	db: DrizzleD1Database,
	clusterId: string,
	nodeId: number
): Promise<D1Result> {
	return await db
		.delete(nodes)
		.where(and(eq(nodes.clusterUuid, clusterId), eq(nodes.id, nodeId)))
		.run();
}
