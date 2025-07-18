import { removeDidPrefix } from '$lib/crypto';
import { getDB } from '$lib/server/db';
import {
	deleteLoginToken,
	getTokensByUserId,
	insertLoginToken
} from '$lib/server/models/login-token';
import { getUserIdByPublicKey } from '$lib/server/models/public-key';
import { generateLoginToken } from '$lib/server/utils';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils';
import type { D1Database } from '@cloudflare/workers-types';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
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
			'/tokens',
			'tokens',
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

		const tokens = await getTokensByUserId(db, userByPublicKey.userId);

		return json({ data: tokens, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
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
			'/tokens',
			'tokens',
			['POST']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);

		const userByPublicKey = await getUserIdByPublicKey(db, removeDidPrefix(publicKey));

		if (!userByPublicKey) {
			return json({ error: 'User not found', success: false }, { status: 404 });
		}

		const token = generateLoginToken();

		const { expiresAt } = await insertLoginToken(db, userByPublicKey.userId, token);

		return json({ data: { token, expiresAt }, success: true }, { status: 201 });
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({
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
			'/profiles',
			'profile',
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

		const { token } = await request.json();

		if (!token) {
			return json({ error: 'Missing token', success: false }, { status: 400 });
		}

		const deleteResult = await deleteLoginToken(db, userByPublicKey.userId, token);

		if (!deleteResult) {
			return json({ error: 'Token has already been deleted', success: false }, { status: 404 });
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing DELETE request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
