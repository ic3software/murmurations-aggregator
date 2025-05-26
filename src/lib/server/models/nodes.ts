import { nodes } from '$lib/server/db/schema';
import type { NodeDbUpdateInput, NodeInsert } from '$lib/types/node';
import type { Node } from '$lib/types/node';
import type { D1Result } from '@cloudflare/workers-types';
import { and, eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getNodes(db: DrizzleD1Database, clusterId: string) {
	return await db.select().from(nodes).where(eq(nodes.clusterUuid, clusterId)).all();
}

export async function createNode(db: DrizzleD1Database, node: NodeInsert): Promise<Node> {
	const result = await db.insert(nodes).values(node).returning().run();
	return result.results[0] as Node;
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
): Promise<Node> {
	const result = await db
		.update(nodes)
		.set(node)
		.where(and(eq(nodes.clusterUuid, clusterId), eq(nodes.id, nodeId)))
		.returning()
		.run();
	return result.results[0] as Node;
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
