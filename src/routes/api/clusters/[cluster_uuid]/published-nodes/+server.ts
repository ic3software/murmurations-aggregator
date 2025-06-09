import { getDB } from '$lib/server/db';
import { getPublishedNodes } from '$lib/server/models/nodes';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params
}) => {
	try {
		const db = getDB(platform.env);
		const clusterUuid = params?.cluster_uuid;

		if (!clusterUuid) {
			return json({ error: 'Missing cluster_uuid', success: false }, { status: 400 });
		}

		const nodes = await getPublishedNodes(db, clusterUuid);

		if (!nodes || nodes.length === 0) {
			return json(
				{ error: 'No nodes found for the given cluster_uuid', success: false },
				{ status: 404 }
			);
		}

		return json({ data: nodes, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
