import { getDB } from '$lib/server/db';
import type { D1Database } from '@cloudflare/workers-types';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { deleteCluster, getCluster, updateCluster } from '$lib/server/models/clusters';
import type { Cluster, ClusterUpdateInput } from '$lib/types/cluster';
import { deleteNodes } from '$lib/server/models/nodes';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params.cluster_id;

		if (!clusterId) {
			return json({ error: 'Missing cluster_id', success: false }, { status: 400 });
		}

		const cluster = await getCluster(db, clusterId);

		if (!cluster) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		// Convert the cluster to an ClusterUpdateInput object
		const editableCluster: Cluster = {
			id: cluster.id,
			clusterId: cluster.clusterId,
			name: cluster.name,
			centerLat: cluster.centerLat,
			centerLon: cluster.centerLon,
			scale: cluster.scale,
			indexUrl: cluster.indexUrl,
			queryUrl: cluster.queryUrl,
			lastUpdated: cluster.lastUpdated,
			createdAt: cluster.createdAt,
			updatedAt: cluster.updatedAt
		};

		return json({ data: editableCluster, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	request
}) => {
	try {
		const db = getDB(platform.env);
		const clusterId = params.cluster_id;

		if (!clusterId) {
			return json({ error: 'Missing cluster_id', success: false }, { status: 400 });
		}

		const cluster = await getCluster(db, clusterId);

		if (!cluster) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		const { name, centerLat, centerLon, scale } = await request.json();

		const updatedCluster: ClusterUpdateInput = {
			name,
			centerLat,
			centerLon,
			scale
		};

		const result = await updateCluster(db, clusterId, updatedCluster);

		if (result?.meta?.changes === 0) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing PUT request:', error);
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

		if (!clusterId) {
			return json({ error: 'Missing cluster_id', success: false }, { status: 400 });
		}

		// Delete the cluster
		const result = await deleteCluster(db, clusterId);

		if (result?.meta?.changes === 0) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		// Delete all nodes in the cluster
		await deleteNodes(db, clusterId);

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing DELETE request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
