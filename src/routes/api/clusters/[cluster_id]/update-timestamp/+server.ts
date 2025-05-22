import { getDB } from '$lib/server/db';
import type { D1Database } from '@cloudflare/workers-types';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { updateClusterTimestamp } from '$lib/server/models/clusters';

export const PATCH: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	request
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params.cluster_id;
		const body = await request.json();
		const { lastUpdated } = body;

		if (!clusterId) {
			return json({ error: 'Missing cluster_id', success: false }, { status: 400 });
		}

		const lastUpdatedDate = new Date(lastUpdated);

		if (isNaN(lastUpdatedDate.getTime())) {
			return json({ error: 'Invalid lastUpdated date', success: false }, { status: 400 });
		}

		const result = await updateClusterTimestamp(db, clusterId, lastUpdatedDate);

		if (result?.meta?.changes === 0) {
			return json({ error: 'Failed to update cluster timestamp', success: false }, { status: 500 });
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error updating cluster timestamp:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
