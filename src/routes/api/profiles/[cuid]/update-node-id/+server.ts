import { authenticateRequest } from '$lib/server/auth';
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

		const authResult = await authenticateRequest(platform, request, {
			parseBody: true,
			requiredUserId: true
		});

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db, body, userId } = authResult.data;

		const { node_id } = body as { node_id: string };

		if (!cuid || !node_id || !userId) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const result = await updateProfileNodeId(db, cuid, userId, node_id);

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
