import { removeDidPrefix } from '$lib/crypto';
import { getDB } from '$lib/server/db';
import { doesUserIdHaveEmail } from '$lib/server/models/email';
import { getUserIdByPublicKey } from '$lib/server/models/public-key';
import { updateUserEmailReset } from '$lib/server/models/user';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils.server';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const PATCH: RequestHandler = async ({
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
			'/users/email-reset',
			'users',
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

		const { emailReset } = await request.json();

		if (typeof emailReset !== 'boolean') {
			return json({ error: 'Invalid emailReset value', success: false }, { status: 400 });
		}

		const hasEmail = await doesUserIdHaveEmail(db, userByPublicKey.userId);
		if (!hasEmail) {
			return json(
				{ error: 'You need to add an email to your account', success: false },
				{ status: 400 }
			);
		}

		await updateUserEmailReset(db, userByPublicKey.userId, emailReset);

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing PATCH request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
