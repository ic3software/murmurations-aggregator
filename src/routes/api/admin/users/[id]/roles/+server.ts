import { getDB } from '$lib/server/db';
import { checkRoleIdsExist } from '$lib/server/models/role';
import { getRoleIdsByUserId, updateUserRoles } from '$lib/server/models/user-role';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils.server';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

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
			`/admin/users/*/roles`,
			'admin-users',
			['GET']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);

		const roleIds = await getRoleIdsByUserId(db, Number(userId));

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
	params,
	request,
	platform = { env: { DB: {} as D1Database } },
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
			`/admin/users/*/roles`,
			'admin-users',
			['POST']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const { role_ids } = await request.json();

		if (!role_ids) {
			return json({ error: 'Role IDs are required', success: false }, { status: 400 });
		}

		const db = getDB(platform.env);

		const roleIdsExist = await checkRoleIdsExist(db, role_ids);

		if (!roleIdsExist) {
			return json({ error: 'Role IDs do not exist', success: false }, { status: 400 });
		}

		await updateUserRoles(db, Number(userId), role_ids);

		return json(
			{
				message: 'User role updated successfully',
				success: true
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating user role:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
