import { getDB } from '$lib/server/db';
import { deleteProfile, getProfileByCuid, updateProfile } from '$lib/server/models/profiles';
import type { ProfileDbUpdateInput } from '$lib/types/profile';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	params,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const { cuid, user_id } = params;
		if (!cuid || !user_id) {
			return json(
				{ error: 'Missing required fields or user not authenticated', success: false },
				{ status: 400 }
			);
		}

		const db = getDB(platform.env);
		const profile = await getProfileByCuid(db, cuid, Number(user_id));

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
		const { title, last_updated, profile, user_id } = await request.json();

		if (!cuid || !title || !last_updated || !profile || !user_id) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		// const validationResponse = await validateProfile(profile);
		// if (!validationResponse.success) {
		// 	if (typeof validationResponse.errors === 'string') {
		// 		return jsonError(validationResponse.errors, 500);
		// 	}
		// 	return json({ success: false, errors: validationResponse.errors }, { status: 422 });
		// }

		const db = getDB(platform.env);
		const profileUpdate: ProfileDbUpdateInput = {
			title,
			lastUpdated: Number(last_updated),
			profile,
			updatedAt: Math.floor(new Date().getTime() / 1000)
		};
		const isUpdated = await updateProfile(db, cuid, user_id, profileUpdate);

		if (isUpdated?.meta?.changes === 0) {
			return json({ error: 'Failed to update profile', success: false }, { status: 404 });
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

export const DELETE: RequestHandler = async ({
	params,
	request,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const { cuid } = params;
		const { user_id } = await request.json();

		if (!cuid || !user_id) {
			return json(
				{ error: 'Missing cuid or user not authenticated', success: false },
				{ status: 400 }
			);
		}

		const db = getDB(platform.env);
		const isDeleted = await deleteProfile(db, cuid, Number(user_id));

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
