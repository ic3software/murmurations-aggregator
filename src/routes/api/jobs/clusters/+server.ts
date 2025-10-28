import { getDB } from '$lib/server/db';
import { createJob } from '$lib/server/models/job';
import type { JobCreateInput } from '$lib/types/job';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	request
}) => {
	try {
		const db = getDB(platform.env);

		const { clusterUuid } = await request.json();

		if (!clusterUuid) {
			return json({ error: 'Missing cluster_uuid', success: false }, { status: 400 });
		}

		const jobUUID = crypto.randomUUID();
		const job: JobCreateInput = {
			jobUuid: jobUUID,
			type: 'sync',
			targetId: clusterUuid,
			targetType: 'clusters'
		};

		const result = await createJob(db, job);

		return json({ data: result?.results[0], success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
