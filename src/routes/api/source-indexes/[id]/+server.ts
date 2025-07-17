import { getDB } from '$lib/server/db';
import {
	deleteSourceIndex,
	getSourceIndexById,
	getSourceIndexByUrl,
	updateSourceIndex
} from '$lib/server/models/source-index';
import type { SourceIndexDbUpdateInput } from '$lib/types/source-index';
import { verifyUcan, verifyUcanWithCapabilities } from '$lib/utils/ucan-utils';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params
}) => {
	try {
		const db = getDB(platform.env);
		const id = parseInt(params.id ?? '');

		if (isNaN(id)) {
			return json({ error: 'Invalid source index ID', success: false }, { status: 400 });
		}

		const sourceIndex = await getSourceIndexById(db, id);

		if (!sourceIndex) {
			return json({ error: 'Source index not found', success: false }, { status: 404 });
		}

		return json({ data: sourceIndex, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	request,
	params,
	cookies
}) => {
	try {
		const id = parseInt(params.id ?? '');

		if (isNaN(id)) {
			return json({ error: 'Invalid source index ID', success: false }, { status: 400 });
		}

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
			'/source-indexes',
			'source-indexes',
			['PUT']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);
		const { url, label, libraryUrl } = await request.json();

		if (!url || !label || !libraryUrl) {
			return json({ error: 'Missing required fields', success: false }, { status: 400 });
		}

		const existingSourceIndex = await getSourceIndexByUrl(db, url);

		if (existingSourceIndex && existingSourceIndex.id !== id) {
			return json({ error: 'URL already exists', success: false }, { status: 409 });
		}

		const updateData: SourceIndexDbUpdateInput = {
			url,
			label,
			libraryUrl,
			updatedAt: Math.floor(new Date().getTime() / 1000)
		};

		const updatedSourceIndex = await updateSourceIndex(db, id, updateData);

		if (updatedSourceIndex?.meta?.changes === 0) {
			return json({ error: 'Source index not found', success: false }, { status: 404 });
		}

		return json({ data: null, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing PUT request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({
	platform = { env: { DB: {} as D1Database } },
	params,
	cookies
}) => {
	try {
		const id = parseInt(params.id ?? '');

		if (isNaN(id)) {
			return json({ error: 'Invalid source index ID', success: false }, { status: 400 });
		}

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
			'/source-indexes',
			'source-indexes',
			['DELETE']
		);

		if (!isVerified) {
			return json({ error: 'Permission denied', success: false }, { status: 403 });
		}

		const db = getDB(platform.env);
		const deletedSourceIndex = await deleteSourceIndex(db, id);

		if (deletedSourceIndex?.meta?.changes === 0) {
			return json({ error: 'Source index not found', success: false }, { status: 404 });
		}

		return json({ data: null, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing DELETE request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
