import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { D1Database } from '@cloudflare/workers-types';
import { createCluster, getClusters } from '$lib/server/models/clusters';
import type { Cluster, DBCluster } from '$lib/types/cluster';
import { getDB } from '$lib/server/db';

export const GET: RequestHandler = async ({ platform = { env: { DB: {} as D1Database } } }) => {
	try {
		const db = getDB(platform.env);
		const clusterData = await getClusters(db);

		const clusters: Cluster[] = clusterData.map((cluster) => ({
			clusterId: cluster.clusterId,
			name: cluster.name,
			indexUrl: cluster.indexUrl,
			queryUrl: cluster.queryUrl,
			centerLat: cluster.centerLat,
			centerLon: cluster.centerLon,
			scale: cluster.scale,
			lastUpdated: cluster.lastUpdated.getTime(),
			createdAt: cluster.createdAt,
			updatedAt: cluster.updatedAt
		}));

		return json({ data: clusters, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	request
}) => {
	try {
		const db = getDB(platform.env);
		const body = await request.json();
		const { name, indexUrl, queryUrl, centerLat, centerLon, scale } = body;

		if (!name || !indexUrl || !queryUrl) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const cluster: DBCluster = {
			clusterId: crypto.randomUUID(),
			name,
			indexUrl,
			queryUrl,
			centerLat: centerLat || 46.603354,
			centerLon: centerLon || 1.888334,
			scale: scale || 5
		};

		await createCluster(db, cluster);
		return json({ data: cluster, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
