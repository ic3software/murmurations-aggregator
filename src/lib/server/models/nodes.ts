import { nodes } from '$lib/server/db/schema';
import type { NodeDbUpdateInput, NodeInsert } from '$lib/types/node';
import type { Node } from '$lib/types/node';
import type { D1Result } from '@cloudflare/workers-types';
import { and, eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function getNodes(db: DrizzleD1Database, clusterUuid: string) {
	return await db.select().from(nodes).where(eq(nodes.clusterUuid, clusterUuid)).all();
}

export async function getNode(db: DrizzleD1Database, clusterUuid: string, profileUrl: string) {
	return await db
		.select()
		.from(nodes)
		.where(and(eq(nodes.clusterUuid, clusterUuid), eq(nodes.profileUrl, profileUrl)))
		.limit(1);
}

export async function createNode(db: DrizzleD1Database, node: NodeInsert): Promise<Node> {
	const result = await db.insert(nodes).values(node).returning().run();
	return result.results[0] as Node;
}

export async function updateNodeStatus(
	db: DrizzleD1Database,
	clusterUuid: string,
	nodeId: number,
	status: string
): Promise<D1Result> {
	return await db
		.update(nodes)
		.set({ status })
		.where(and(eq(nodes.clusterUuid, clusterUuid), eq(nodes.id, nodeId)))
		.run();
}

export async function updateNode(
	db: DrizzleD1Database,
	clusterUuid: string,
	nodeId: number,
	node: NodeDbUpdateInput
): Promise<Node> {
	const result = await db
		.update(nodes)
		.set(node)
		.where(and(eq(nodes.clusterUuid, clusterUuid), eq(nodes.id, nodeId)))
		.returning()
		.run();
	return result.results[0] as Node;
}

export async function deleteNodes(db: DrizzleD1Database, clusterUuid: string): Promise<D1Result> {
	return await db.delete(nodes).where(eq(nodes.clusterUuid, clusterUuid)).run();
}

export async function deleteNode(
	db: DrizzleD1Database,
	clusterUuid: string,
	nodeId: number
): Promise<D1Result> {
	return await db
		.delete(nodes)
		.where(and(eq(nodes.clusterUuid, clusterUuid), eq(nodes.id, nodeId)))
		.run();
}
