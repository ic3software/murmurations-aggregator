import { validateProfile } from '$lib/api/profiles';
import { authenticateRequest } from '$lib/server/auth';
import { createProfile, getProfilesByUserId } from '$lib/server/models/profiles';
import type { ProfileInsert, ProfileObject } from '$lib/types/profile';
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
			requiredUserId: true
		});

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db, body, userId } = authResult.data;

		if (!body) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		if (!userId) {
			return json({ error: 'Missing user ID', success: false }, { status: 400 });
		}

		const { linkedSchemas, title, profile, nodeId, lastUpdated } = body as {
			linkedSchemas: string;
			title: string;
			profile: string;
			nodeId: string;
			lastUpdated: number;
		};

		// Validate profile
		const validationResult = await validateProfile(JSON.parse(profile) as ProfileObject);
		if (validationResult.errors) {
			return json({ errors: validationResult.errors, success: false }, { status: 422 });
		}

		const cuid = createId();
		const profileInsert: ProfileInsert = {
			cuid,
			userId,
			lastUpdated,
			linkedSchemas,
			title,
			profile,
			nodeId
		};

		await createProfile(db, profileInsert);

		return json({ data: profileInsert, success: true }, { status: 201 });
	} catch (err) {
		console.error(`Profile save failed: ${err}`);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
