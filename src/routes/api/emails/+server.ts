import { removeDidPrefix } from '$lib/crypto';
import { getDB } from '$lib/server/db';
import {
	checkEmailExists,
	deleteEmail,
	doesUserIdHaveEmail,
	getEmailByUserIdAndEmail,
	getEmailsByUserId,
	insertEmail
} from '$lib/server/models/email';
import { getUserIdByPublicKey } from '$lib/server/models/public-key';
import { getByUserId, updateUserEmailReset } from '$lib/server/models/user';
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
			'/emails',
			'emails',
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

		const userEmails = await getEmailsByUserId(db, userByPublicKey.userId);

		return json({ data: userEmails, success: true }, { status: 200 });
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
			'/emails',
			'emails',
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

		const { email } = await request.json();

		if (!email) {
			return json({ error: 'Missing email', success: false }, { status: 400 });
		}

		const existingEmail = await checkEmailExists(db, email);
		if (existingEmail) {
			return json({ error: 'Email already exists', success: false }, { status: 409 });
		}

		await insertEmail(db, userByPublicKey.userId, email.toLowerCase());

		return json({ data: { email }, success: true }, { status: 201 });
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
			'/emails',
			'emails',
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

		const { email } = await request.json();
		if (!email) {
			return json({ error: 'Missing email', success: false }, { status: 400 });
		}

		const existingEmail = await getEmailByUserIdAndEmail(db, userByPublicKey.userId, email);

		if (!existingEmail) {
			return json({ error: 'Email not found', success: false }, { status: 404 });
		}

		await deleteEmail(db, existingEmail.id);

		// In future, we'll support multiple emails, so we need to check if the user has any emails left
		const hasEmail = await doesUserIdHaveEmail(db, userByPublicKey.userId);
		const user = await getByUserId(db, userByPublicKey.userId);
		let emailReset = user?.emailReset ?? false;
		if (!hasEmail && emailReset) {
			emailReset = false;
			await updateUserEmailReset(db, userByPublicKey.userId, emailReset);
		}

		return json({ data: { email, emailReset }, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing DELETE request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
