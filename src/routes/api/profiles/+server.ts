import { authenticateRequest } from '$lib/server/auth';
import { createProfile, getProfilesByUserId } from '$lib/server/models/profiles';
import type { ProfileInsert } from '$lib/types/profile';
import type { D1Database } from '@cloudflare/workers-types';
import { createId } from '@paralleldrive/cuid2';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	request,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const authResult = await authenticateRequest(platform, request, {
			parseBody: false,
			requiredUserId: true
		});

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db, userId } = authResult.data;

		if (userId === undefined || isNaN(userId)) {
			return json({ error: 'Invalid user ID', success: false }, { status: 400 });
		}

		const profiles = await getProfilesByUserId(db, userId);

		for (const profile of profiles) {
			if (profile.linkedSchemas) {
				profile.linkedSchemas = JSON.parse(profile.linkedSchemas);
			}
			if (profile.profile) {
				profile.profile = JSON.parse(profile.profile);
			}
		}

		return json({ data: profiles, success: true });
	} catch (err) {
		console.error(`Failed to fetch profiles: ${err}`);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({
	request,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const authResult = await authenticateRequest(platform, request, {
			parseBody: true,
			requiredUserId: false
		});

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db, body } = authResult.data;

		if (!body) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const { userId, linkedSchemas, title, profile, nodeId } = body as {
			userId: number;
			linkedSchemas: string;
			title: string;
			profile: string;
			nodeId: string;
		};

		const profileInsert: ProfileInsert = {
			cuid: createId(),
			userId: userId ?? 0,
			lastUpdated: Math.floor(Date.now() / 1000),
			linkedSchemas: linkedSchemas ?? null,
			title: title ?? null,
			profile: profile ?? null,
			nodeId: nodeId ?? null
		};

		await createProfile(db, profileInsert);

		return json({ data: profileInsert, success: true }, { status: 200 });
	} catch (err) {
		console.error(`Profile save failed: ${err}`);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
