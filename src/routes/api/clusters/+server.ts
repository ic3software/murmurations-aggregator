import { getDB } from '$lib/server/db';
import { createCluster, getClusters } from '$lib/server/models/cluster';
import type { ClusterInsert, ClusterPublic } from '$lib/types/cluster';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform = { env: { DB: {} as D1Database } } }) => {
	try {
		const db = getDB(platform.env);
		const clusterData = await getClusters(db);

		const clusters: ClusterPublic[] = clusterData as ClusterPublic[];

		return json({ data: clusters, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
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
			'/clusters',
			'clusters',
			['POST']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);
		const body = await request.json();
		const { name, indexUrl, queryUrl, centerLat, centerLon, scale } = body;

		if (!name || !indexUrl || !queryUrl) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const cluster: ClusterInsert = {
			clusterUuid: crypto.randomUUID(),
			name,
			indexUrl,
			queryUrl,
			centerLat,
			centerLon,
			scale
		};

		await createCluster(db, cluster);
		return json({ data: cluster, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
