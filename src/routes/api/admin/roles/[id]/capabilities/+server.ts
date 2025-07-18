import { getDB } from '$lib/server/db';
import {
	getCapabilityIdsByRoleId,
	updateRoleCapabilities
} from '$lib/server/models/role-capability';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	cookies
}) => {
	const userId = params.id;

	if (!userId) {
		return json({ error: 'User ID is required', success: false }, { status: 400 });
	}

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
			`/admin/roles/*/capabilities`,
			'admin-roles',
			['GET']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);

		const roleIds = await getCapabilityIdsByRoleId(db, Number(userId));

		return json(
			{
				data: roleIds,
				success: true
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching user role:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	request,
	params,
	cookies
}) => {
	const roleId = params.id;

	if (!roleId) {
		return json({ error: 'Role ID is required', success: false }, { status: 400 });
	}

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
			`/admin/roles/*/capabilities`,
			'admin-roles',
			['POST']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const { capability_ids } = await request.json();

		if (!Array.isArray(capability_ids)) {
			return json({ error: 'capability_ids must be an array', success: false }, { status: 400 });
		}

		const db = getDB(platform.env);

		await updateRoleCapabilities(db, Number(roleId), capability_ids);

		return json(
			{
				success: true
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating role capabilities:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
