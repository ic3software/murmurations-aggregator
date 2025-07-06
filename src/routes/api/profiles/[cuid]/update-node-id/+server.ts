import { getDB } from '$lib/server/db';
import { updateProfileNodeId } from '$lib/server/models/profiles';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({
	request,
	params,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const { cuid } = params;
		const { node_id, user_id } = await request.json();

		if (!cuid || !node_id || !user_id) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const db = getDB(platform.env);
		const result = await updateProfileNodeId(db, cuid, user_id, node_id);

		if (result?.meta?.changes === 0) {
			return json({ error: 'Profile not found', success: false }, { status: 404 });
		}

		return json({ success: true }, { status: 200 });
	} catch (err) {
		console.error(`Profile update failed: ${err}`);
		return json(
			{
				error: 'Unable to connect to the database, please try again in a few minutes',
				success: false
			},
			{ status: 500 }
		);
	}
};
