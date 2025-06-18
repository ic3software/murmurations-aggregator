import { authenticateRequest } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import {
	deleteSourceIndex,
	getSourceIndexById,
	getSourceIndexByUrl,
	updateSourceIndex
} from '$lib/server/models/source-indexes';
import type { SourceIndexDbUpdateInput, SourceIndexUpdateInput } from '$lib/types/source-index';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({
	params,
	platform = { env: { DB: {} as D1Database } }
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
	request,
	params,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const authResult = await authenticateRequest(platform, request, { parseBody: true });

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db, body } = authResult.data;
		const id = parseInt(params.id ?? '');

		if (isNaN(id)) {
			return json({ error: 'Invalid source index ID', success: false }, { status: 400 });
		}

		const { url, label } = body as SourceIndexUpdateInput;

		const existingSourceIndex = await getSourceIndexByUrl(db, url);

		if (existingSourceIndex && existingSourceIndex.id !== id) {
			return json({ error: 'URL already exists', success: false }, { status: 409 });
		}

		const updateData: SourceIndexDbUpdateInput = {
			url,
			label,
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
	request,
	params,
	platform = { env: { DB: {} as D1Database } }
}) => {
	try {
		const authResult = await authenticateRequest(platform, request, { parseBody: false });

		if (!authResult.success) {
			return json({ error: authResult.error, success: false }, { status: authResult.status });
		}

		const { db } = authResult.data;
		const id = parseInt(params.id ?? '');

		if (isNaN(id)) {
			return json({ error: 'Invalid source index ID', success: false }, { status: 400 });
		}

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
