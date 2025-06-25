import { getDB } from '$lib/server/db';
import { getCluster } from '$lib/server/models/clusters';
import { getSourceIndexByUrl } from '$lib/server/models/source-indexes';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	params,
	platform = { env: { DB: {} as D1Database } },
	fetch
}) => {
	try {
		const db = getDB(platform.env);
		const clusterUuid = params.cluster_uuid;

		if (!clusterUuid) {
			return json({ error: 'Invalid cluster UUID', success: false }, { status: 400 });
		}

		const cluster = await getCluster(db, clusterUuid);

		if (!cluster) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		const sourceIndex = await getSourceIndexByUrl(db, cluster.indexUrl);

		if (!sourceIndex) {
			return json({ error: 'Source index not found', success: false }, { status: 404 });
		}

		const queryUrl = new URL(cluster.queryUrl, 'http://localhost');
		const schema = queryUrl.searchParams.get('schema');

		if (!schema) {
			return json({ error: 'Schema not found in query URL', success: false }, { status: 400 });
		}

		const schemaUrl = `${sourceIndex.libraryUrl}/schemas/${schema}`;
		const response = await fetch(schemaUrl, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const schemaData = await response.json();

		if (!response.ok) {
			return json({ error: 'Failed to fetch schema', success: false }, { status: 500 });
		}

		return json({ data: schemaData, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
