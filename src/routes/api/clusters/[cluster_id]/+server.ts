import { getDB } from '$lib/server/db';
import type { D1Database } from '@cloudflare/workers-types';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { deleteCluster } from '$lib/server/models/clusters';

export const DELETE: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params.cluster_id;

		if (!clusterId) {
			return json({ error: 'Missing cluster_id', success: false }, { status: 400 });
		}

		const result = await deleteCluster(db, clusterId);

		if (result?.meta?.changes === 0) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing DELETE request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
