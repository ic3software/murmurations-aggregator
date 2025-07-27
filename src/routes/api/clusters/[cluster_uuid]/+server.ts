import { getDB } from '$lib/server/db';
import { deleteCluster, getCluster, updateCluster } from '$lib/server/models/cluster';
import { deleteNodes } from '$lib/server/models/node';
import type { ClusterDbUpdateInput, ClusterPublic } from '$lib/types/cluster';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils.server';
import type { D1Database } from '@cloudflare/workers-types';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params
}) => {
	try {
		const db = getDB(platform.env);
		const clusterUuid = params.cluster_uuid;

		if (!clusterUuid) {
			return json({ error: 'Missing cluster_uuid', success: false }, { status: 400 });
		}

		const cluster = await getCluster(db, clusterUuid);

		if (!cluster) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		const clusterPublic: ClusterPublic = { ...cluster };

		return json({ data: clusterPublic, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	request,
	cookies
}) => {
	try {
		const ucanToken = cookies.get('ucan_token');

		if (!ucanToken) {
			return json({ error: 'Unauthorized', success: false }, { status: 401 });
		}

		const publicKey = await verifyUcan(ucanToken);

		if (!publicKey) {
			return json({ error: 'Unauthorized', success: false }, { status: 401 });
		}

		const isVerified = await verifyUcanWithCapabilities(
			ucanToken,
			publicKey,
			'api',
			'/clusters/*',
			'clusters',
			['PUT']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);
		const clusterUuid = params.cluster_uuid;

		if (!clusterUuid) {
			return json({ error: 'Missing cluster_uuid', success: false }, { status: 400 });
		}

		const cluster = await getCluster(db, clusterUuid);

		if (!cluster) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		const { name, centerLat, centerLon, scale } = await request.json();

		const updatedCluster: ClusterDbUpdateInput = {
			name,
			centerLat,
			centerLon,
			scale,
			updatedAt: Math.floor(new Date().getTime() / 1000)
		};

		const result = await updateCluster(db, clusterUuid, updatedCluster);

		if (result?.meta?.changes === 0) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		return json({ data: null, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing PUT request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	cookies
}) => {
	try {
		const ucanToken = cookies.get('ucan_token');

		if (!ucanToken) {
			return json({ error: 'Unauthorized', success: false }, { status: 401 });
		}

		const publicKey = await verifyUcan(ucanToken);

		if (!publicKey) {
			return json({ error: 'Unauthorized', success: false }, { status: 401 });
		}

		const isVerified = await verifyUcanWithCapabilities(
			ucanToken,
			publicKey,
			'api',
			'/clusters/*',
			'clusters',
			['DELETE']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);
		const clusterUuid = params.cluster_uuid;

		if (!clusterUuid) {
			return json({ error: 'Missing cluster_uuid', success: false }, { status: 400 });
		}

		// Delete the cluster
		const result = await deleteCluster(db, clusterUuid);

		if (result?.meta?.changes === 0) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		// Delete all nodes in the cluster
		await deleteNodes(db, clusterUuid);

		return json({ data: null, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing DELETE request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
