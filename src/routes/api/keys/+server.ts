import { removeDidPrefix } from '$lib/crypto';
import { getDB } from '$lib/server/db';
import { deleteLoginToken, isTokenValidAndGetUserId } from '$lib/server/models/login-token';
import {
	deletePublicKey,
	getPublicKeysByUserId,
	getUserIdByPublicKey,
	insertPublicKey
} from '$lib/server/models/public-key';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils.server';
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
			'/keys',
			'keys',
			['GET']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);
		const userPublicKey = removeDidPrefix(publicKey);
		const userByPublicKey = await getUserIdByPublicKey(db, userPublicKey);

		if (!userByPublicKey) {
			return json({ error: 'User not found', success: false }, { status: 404 });
		}

		const userPublicKeys = await getPublicKeysByUserId(db, userByPublicKey.userId);

		return json(
			{ data: { publicKeys: userPublicKeys, currentPublicKey: userPublicKey }, success: true },
			{ status: 200 }
		);
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
			'/keys',
			'keys',
			['POST']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);
		const userPublicKey = removeDidPrefix(publicKey);

		const { token } = await request.json();

		if (!token) {
			return json({ error: 'Missing token', success: false }, { status: 400 });
		}

		const userId = await isTokenValidAndGetUserId(db, token);

		if (!userId) {
			return json({ error: 'Invalid or expired token', success: false }, { status: 404 });
		}

		const existingPublicKey = await getUserIdByPublicKey(db, userPublicKey);

		if (existingPublicKey) {
			return json(
				{ error: 'You have already linked this public key to another account', success: false },
				{ status: 409 }
			);
		}

		await insertPublicKey(db, userId, userPublicKey);
		await deleteLoginToken(db, userId, token);

		return json({ data: { publicKey: userPublicKey }, success: true }, { status: 201 });
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

		const ucanPublicKey = await verifyUcan(ucanToken);

		if (!ucanPublicKey) {
			return json({ error: 'Unauthorized', success: false }, { status: 401 });
		}

		const isVerified = await verifyUcanWithCapabilities(
			ucanToken,
			ucanPublicKey,
			'api',
			'/profiles',
			'profile',
			['GET']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const { publicKey } = await request.json();

		if (!publicKey) {
			return json({ error: 'Missing public key', success: false }, { status: 400 });
		}

		const userPublicKey = removeDidPrefix(ucanPublicKey);
		if (userPublicKey === publicKey) {
			return json(
				{ error: 'Cannot delete the current public key', success: false },
				{ status: 400 }
			);
		}

		const db = getDB(platform.env);

		const userByPublicKey = await getUserIdByPublicKey(db, userPublicKey);

		if (!userByPublicKey) {
			return json({ error: 'User not found', success: false }, { status: 404 });
		}

		const deleteResult = await deletePublicKey(db, userByPublicKey.userId, publicKey);

		if (!deleteResult) {
			return json(
				{ error: 'Public key has already been deleted', success: false },
				{ status: 404 }
			);
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing DELETE request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
