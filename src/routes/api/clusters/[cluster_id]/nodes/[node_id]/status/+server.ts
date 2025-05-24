import { getDB } from '$lib/server/db';
import { updateNodeStatus } from '$lib/server/models/nodes';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	request
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params.cluster_id;
		const nodeId = params.node_id;
		const { status } = await request.json();

		// Validate input
		if (!clusterId || !nodeId) {
			return json({ error: 'Missing cluster_id or node_id', success: false }, { status: 400 });
		}

		if (!Number.isInteger(parseInt(nodeId))) {
			return json({ error: 'Invalid node_id', success: false }, { status: 400 });
		}

		if (!status) {
			return json({ error: 'Missing status', success: false }, { status: 400 });
		}

		// Update node status
		const result = await updateNodeStatus(db, clusterId, parseInt(nodeId), status);

		if (!result) {
			return json({ error: 'Failed to update node status', success: false }, { status: 500 });
		}

		return json({ data: null, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing PUT request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
