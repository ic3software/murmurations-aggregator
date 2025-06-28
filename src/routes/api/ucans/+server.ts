import { PRIVATE_SERVER_KEY } from '$env/static/private';
import { authenticateRequest } from '$lib/server/auth';
import { getUserIdByPublicKey } from '$lib/server/models/public-key';
import { emailCapability } from '$lib/ucan/capabilities/email';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import * as ucans from '@ucans/ucans';
import type { EdKeypair } from '@ucans/ucans';

let keypair: EdKeypair;

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	request
}) => {
	try {
		if (!PRIVATE_SERVER_KEY) {
			return json({ error: 'Server DID is not configured', success: false }, { status: 500 });
		}

		if (!keypair) {
			keypair = ucans.EdKeypair.fromSecretKey(PRIVATE_SERVER_KEY);
		}

		const authResult = await authenticateRequest(platform, request, { parseBody: true });

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db, xPublicKey } = authResult.data;

		const userId = await getUserIdByPublicKey(db, xPublicKey);

		if (!userId) {
			return json(
				{ error: 'User not found or public key not linked to any user', success: false },
				{ status: 404 }
			);
		}

		const publicDid = 'did:key:z' + xPublicKey;

		const ucan = await ucans.build({
			issuer: keypair,
			audience: publicDid,
			lifetimeInSeconds: 60 * 60,
			capabilities: [
				emailCapability('create', publicDid),
				emailCapability('read', publicDid),
				emailCapability('delete', publicDid)
			]
		});

		const token = ucans.encode(ucan);

		return json({ data: { token }, success: true }, { status: 201 });
	} catch (error) {
		console.log('error', error);
		console.error('Error processing POST request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
