import { getDB } from '$lib/server/db';
import { createCapability, getCapabilities } from '$lib/server/models/capability';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils.server';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

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
			'/admin/capabilities',
			'admin-capabilities',
			['GET']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);

		const allCapabilities = await getCapabilities(db);

		return json({ data: allCapabilities, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error fetching capabilities:', error);
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
			'/admin/capabilities',
			'admin-capabilities',
			['POST']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const { scheme, hierPart, namespace, segments } = await request.json();

		if (!scheme || !hierPart || !namespace || !segments) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const db = getDB(platform.env);

		await createCapability(db, {
			scheme,
			hierPart,
			namespace,
			segments
		});

		return json({ success: true }, { status: 201 });
	} catch (error) {
		console.error('Error creating capability:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
