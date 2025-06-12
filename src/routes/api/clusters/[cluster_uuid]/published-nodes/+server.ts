import { getDB } from '$lib/server/db';
import { getPublishedNodeCount, getPublishedNodes } from '$lib/server/models/nodes';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	url
}) => {
	try {
		const db = getDB(platform.env);
		const clusterUuid = params?.cluster_uuid;

		if (!clusterUuid) {
			return json({ error: 'Missing cluster_uuid', success: false }, { status: 400 });
		}

		const page = Math.max(Number(url.searchParams.get('page') || 1), 1);
		const limit = Math.max(Number(url.searchParams.get('limit') || 12), 1);
		const offset = (page - 1) * limit;

		const totalCount = await getPublishedNodeCount(db, clusterUuid);

		const nodes = await getPublishedNodes(db, clusterUuid, limit, offset);

		if (!nodes || nodes.length === 0) {
			return json(
				{ error: 'No nodes found for the given cluster_uuid', success: false },
				{ status: 404 }
			);
		}

		return json(
			{
				data: nodes,
				meta: {
					total: totalCount,
					perPage: limit,
					currentPage: page,
					totalPages: Math.ceil(totalCount / limit)
				},
				success: true
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
