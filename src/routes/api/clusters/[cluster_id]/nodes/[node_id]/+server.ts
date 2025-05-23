import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';
import type { D1Database } from '@cloudflare/workers-types';
import { deleteNode, updateNode } from '$lib/server/models/nodes';
import type { NodeDbUpdateInput } from '$lib/types/node';

export const PUT: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	request
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params.cluster_id;
		const nodeId = params.node_id;

		// Validate input
		if (!clusterId || !nodeId) {
			return json({ error: 'Missing cluster_id or node_id', success: false }, { status: 400 });
		}

		if (!Number.isInteger(parseInt(nodeId))) {
			return json({ error: 'Invalid node_id', success: false }, { status: 400 });
		}

		const { data, status, lastUpdated, isAvailable, unavailableMessage, hasAuthority } =
			await request.json();

		const node: NodeDbUpdateInput = {
			data: JSON.stringify(data),
			status,
			lastUpdated,
			isAvailable,
			unavailableMessage,
			hasAuthority
		};

		// Update node
		const result = await updateNode(db, clusterId, parseInt(nodeId), node);

		if (result?.meta?.changes === 0) {
			return json({ error: 'Failed to update node', success: false }, { status: 500 });
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing PATCH request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params.cluster_id;
		const nodeId = params.node_id;

		// Validate input
		if (!clusterId || !nodeId) {
			return json({ error: 'Missing cluster_id or node_id', success: false }, { status: 400 });
		}

		if (!Number.isInteger(parseInt(nodeId))) {
			return json({ error: 'Invalid node_id', success: false }, { status: 400 });
		}

		// Delete node
		const result = await deleteNode(db, clusterId, parseInt(nodeId));

		if (result?.meta?.changes === 0) {
			return json({ error: 'Failed to delete node', success: false }, { status: 500 });
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing DELETE request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
