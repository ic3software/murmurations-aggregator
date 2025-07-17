import { PRIVATE_SERVER_KEY } from '$env/static/private';
import { authenticateRequest } from '$lib/server/auth';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { EdKeypair } from '@ucans/ucans';
import * as ucans from '@ucans/ucans';

import type { RequestHandler } from './$types';

let keypair: EdKeypair;

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	request,
	cookies
}) => {
	try {
		if (!PRIVATE_SERVER_KEY) {
			return json({ error: 'Server DID is not configured', success: false }, { status: 500 });
		}

		if (!keypair) {
			keypair = ucans.EdKeypair.fromSecretKey(PRIVATE_SERVER_KEY);
		}

		const authResult = await authenticateRequest(platform, request, {
			parseBody: false,
			requiredUserId: true
		});

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { xPublicKey } = authResult.data;

		const userDid = 'did:key:z' + xPublicKey;

		const ucanToken = await ucans.build({
			issuer: keypair,
			audience: userDid,
			lifetimeInSeconds: 60 * 60
		});

		const token = ucans.encode(ucanToken);

		cookies.set('ucan_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24
		});

		return json({ data: { token }, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
