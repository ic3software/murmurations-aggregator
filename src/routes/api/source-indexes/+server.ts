import { getDB } from '$lib/server/db';
import { getSourceIndexes } from '$lib/server/models/source-indexes';
import type { SourceIndex } from '$lib/types/source-index';
import type { D1Database } from '@cloudflare/workers-types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform = { env: { DB: {} as D1Database } } }) => {
	try {
		const db = getDB(platform.env);
		const sourceIndexData = await getSourceIndexes(db);

		const sourceIndexes: SourceIndex[] = sourceIndexData as SourceIndex[];

		return json({ data: sourceIndexes, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};
