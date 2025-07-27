import { getDB } from '$lib/server/db';
import { createRole, getRoles } from '$lib/server/models/role';
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
			'/admin/roles',
			'admin-roles',
			['GET']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);

		const allRoles = await getRoles(db);

		return json({ data: allRoles, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error fetching roles:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	cookies,
	request
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
			'/admin/roles',
			'admin-roles',
			['POST']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const { name, description } = await request.json();

		if (
			!name ||
			typeof name !== 'string' ||
			!name.trim() ||
			!description ||
			typeof description !== 'string' ||
			!description.trim()
		) {
			return json(
				{ error: 'Role name and description are required', success: false },
				{ status: 400 }
			);
		}

		const db = getDB(platform.env);

		// Check if role with this name already exists
		const existingRoles = await getRoles(db);
		const roleExists = existingRoles.some(
			(role) => role.name.toLowerCase() === name.trim().toLowerCase()
		);

		if (roleExists) {
			return json({ error: 'Role with this name already exists', success: false }, { status: 409 });
		}

		await createRole(db, {
			name: name.trim(),
			description: description?.trim() || null
		});

		return json({ success: true }, { status: 201 });
	} catch (error) {
		console.error('Error creating role:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
