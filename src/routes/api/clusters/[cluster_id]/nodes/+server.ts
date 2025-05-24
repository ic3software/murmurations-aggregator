import { getDB } from '$lib/server/db';
import { createNode, getNodes } from '$lib/server/models/nodes';
import type { NodeInsert } from '$lib/types/node';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

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
		const { profileUrl, data, lastUpdated, status, isAvailable, unavailableMessage, hasAuthority } =
			body;

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
		const node: NodeInsert = {
			clusterUuid: clusterId,
			profileUrl,
			data: JSON.stringify(data),
			lastUpdated: new Date(lastUpdated * 1000),
			status,
			isAvailable,
			unavailableMessage,
			hasAuthority
		};

		const result = await createNode(db, node);

		return json({ data: result, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
