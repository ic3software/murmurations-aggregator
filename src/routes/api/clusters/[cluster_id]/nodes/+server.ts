import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';
import type { D1Database } from '@cloudflare/workers-types';
import type { NodeDbCreateInput } from '$lib/types/node';
import { createNode, getNodes } from '$lib/server/models/nodes';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params?.cluster_id;

		// Validate clusterId
		if (!clusterId) {
			return json({ error: 'Missing cluster_id', success: false }, { status: 400 });
		}

		const nodes = await getNodes(db, clusterId);

		if (!nodes || nodes.length === 0) {
			return json(
				{ error: 'No nodes found for the given cluster_id', success: false },
				{ status: 404 }
			);
		}

		return json({ data: nodes, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	request
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params?.cluster_id;
		const body = await request.json();
		const { profileUrl, data, lastUpdated, status } = body;

		// Validate data
		if (!clusterId) {
			return json({ error: 'Missing cluster_id', success: false }, { status: 400 });
		}

		if (!data || !profileUrl || !lastUpdated) {
			return json({ error: 'Invalid data provided', success: false }, { status: 400 });
		}

		if (profileUrl.length > 2000) {
			return json({ error: 'profile_url is too long', success: false }, { status: 400 });
		}

		if (!Number.isInteger(lastUpdated)) {
			return json({ error: 'lastUpdated is not an integer', success: false }, { status: 400 });
		}

		// Insert data
		const node: NodeDbCreateInput = {
			clusterUuid: clusterId,
			profileUrl,
			data: JSON.stringify(data),
			lastUpdated: new Date(lastUpdated * 1000),
			status: status ?? 'new'
		};

		const result = await createNode(db, node);

		if (!result) {
			return json({ error: 'Failed to create node', success: false }, { status: 500 });
		}

		return json({ data: result, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
