import { validateProfile } from '$lib/api/profiles';
import { authenticateRequest } from '$lib/server/auth';
import { deleteProfile, getProfileByCuid, updateProfile } from '$lib/server/models/profiles';
import type { ProfileDbUpdateInput, ProfileObject } from '$lib/types/profile';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	params,
	request,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const { cuid } = params;
		if (!cuid) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const authResult = await authenticateRequest(platform, request, {
			parseBody: false,
			requiredUserId: true
		});

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db, userId } = authResult.data;

		const profile = await getProfileByCuid(db, cuid, Number(userId));

		if (!profile) {
			return json({ error: 'Profile not found', success: false }, { status: 404 });
		}

		return json({ data: profile, success: true }, { status: 200 });
	} catch (err) {
		console.error(`Failed to get profile: ${err}`);
		return json(
			{
				error: 'Unable to connect to the database, please try again in a few minutes',
				success: false
			},
			{ status: 500 }
		);
	}
};

export const PATCH: RequestHandler = async ({
	params,
	request,
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

		const { title, lastUpdated, profile } = body as {
			title: string;
			lastUpdated: number;
			profile: string;
		};

		if (!cuid || !title || !lastUpdated || !profile) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const validationResult = await validateProfile(JSON.parse(profile) as ProfileObject);
		if (validationResult.errors) {
			return json({ errors: validationResult.errors, success: false }, { status: 422 });
		}

		const profileUpdate: ProfileDbUpdateInput = {
			title,
			lastUpdated: Number(lastUpdated),
			profile,
			updatedAt: Math.floor(new Date().getTime() / 1000)
		};
		const isUpdated = await updateProfile(db, cuid, Number(userId), profileUpdate);

		if (isUpdated?.meta?.changes === 0) {
			return json({ error: 'Failed to update profile', success: false }, { status: 404 });
		}

		return json({ data: profileUpdate, success: true }, { status: 200 });
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

export const DELETE: RequestHandler = async ({
	params,
	request,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const { cuid } = params;

		const authResult = await authenticateRequest(platform, request, {
			parseBody: false,
			requiredUserId: true
		});

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db, userId } = authResult.data;

		if (!cuid || !userId) {
			return json(
				{ error: 'Missing cuid or user not authenticated', success: false },
				{ status: 400 }
			);
		}

		const isDeleted = await deleteProfile(db, cuid, Number(userId));

		if (isDeleted?.meta?.changes === 0) {
			return json({ error: 'Failed to delete profile', success: false }, { status: 404 });
		}

		return json({ success: true }, { status: 200 });
	} catch (err) {
		console.error(`Profile deletion failed: ${err}`);
		return json(
			{
				error: 'Unable to connect to the database, please try again in a few minutes',
				success: false
			},
			{ status: 500 }
		);
	}
};
