import { validateProfile } from '$lib/api/profiles';
import { removeDidPrefix } from '$lib/crypto';
import { getDB } from '$lib/server/db';
import { deleteProfile, getProfileByCuid, updateProfile } from '$lib/server/models/profiles';
import { getUserIdByPublicKey } from '$lib/server/models/public-key';
import type { ProfileDbUpdateInput, ProfileObject } from '$lib/types/profile';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	cookies
}) => {
	try {
		const { cuid } = params;
		if (!cuid) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

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
			'/profiles/*',
			'profiles',
			['GET']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);

		const userByPublicKey = await getUserIdByPublicKey(db, removeDidPrefix(publicKey));

		if (!userByPublicKey) {
			return json({ error: 'User not found', success: false }, { status: 404 });
		}

		const profile = await getProfileByCuid(db, cuid, userByPublicKey.userId);

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
	platform = { env: { DB: {} as D1Database } },
	params,
	request,
	cookies
}) => {
	try {
		const { cuid } = params;

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
			'/profiles/*',
			'profiles',
			['PATCH']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);

		const userByPublicKey = await getUserIdByPublicKey(db, removeDidPrefix(publicKey));

		if (!userByPublicKey) {
			return json({ error: 'User not found', success: false }, { status: 404 });
		}

		const { title, lastUpdated, profile } = await request.json();

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
		const isUpdated = await updateProfile(db, cuid, userByPublicKey.userId, profileUpdate);

		if (isUpdated?.meta?.changes === 0) {
			return json({ error: 'Failed to update profile', success: false }, { status: 404 });
		}

		return json(
			{
				data: {
					cuid,
					title: profileUpdate.title,
					lastUpdated: profileUpdate.lastUpdated,
					profile: profileUpdate.profile,
					updatedAt: profileUpdate.updatedAt
				},
				success: true
			},
			{ status: 200 }
		);
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
	platform = { env: { DB: {} as D1Database } },
	params,
	cookies
}) => {
	try {
		const { cuid } = params;

		if (!cuid) {
			return json({ error: 'Missing cuid', success: false }, { status: 400 });
		}

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
			'/profiles/*',
			'profiles',
			['DELETE']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);

		const userByPublicKey = await getUserIdByPublicKey(db, removeDidPrefix(publicKey));

		if (!userByPublicKey) {
			return json({ error: 'User not found', success: false }, { status: 404 });
		}

		const isDeleted = await deleteProfile(db, cuid, userByPublicKey.userId);

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
