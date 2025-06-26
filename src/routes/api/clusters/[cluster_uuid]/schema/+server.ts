import { getDB } from '$lib/server/db';
import { getCluster } from '$lib/server/models/clusters';
import { getDistinctLinkedSchemas } from '$lib/server/models/nodes';
import { getSourceIndexByUrl } from '$lib/server/models/source-indexes';
import type { D1Database } from '@cloudflare/workers-types';
import { json, type RequestHandler } from '@sveltejs/kit';
import type { JSONSchema7 } from 'json-schema';

export const GET: RequestHandler = async ({
	params,
	platform = { env: { DB: {} as D1Database } },
	fetch
}) => {
	try {
		const db = getDB(platform.env);
		const clusterUuid = params.cluster_uuid;

		if (!clusterUuid) {
			return json({ error: 'Invalid cluster UUID', success: false }, { status: 400 });
		}

		const cluster = await getCluster(db, clusterUuid);

		if (!cluster) {
			return json({ error: 'Cluster not found', success: false }, { status: 404 });
		}

		const sourceIndex = await getSourceIndexByUrl(db, cluster.indexUrl);

		if (!sourceIndex) {
			return json({ error: 'Source index not found', success: false }, { status: 404 });
		}

		const linkedSchemas = await getDistinctLinkedSchemas(db, clusterUuid);

		if (linkedSchemas.length === 0) {
			return json({ error: 'No linked schemas found', success: false }, { status: 404 });
		}

		const fetchedSchemas: JSONSchema7[] = [];

		for (const schemaName of linkedSchemas) {
			const schemaUrl = `${sourceIndex.libraryUrl}/schemas/${schemaName}`;
			const response = await fetch(schemaUrl, {
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				console.error(`Failed to fetch schema: ${schemaName}`);
				continue;
			}

			const schema: JSONSchema7 = await response.json();
			fetchedSchemas.push(schema);
		}

		const schemaData = mergeSchemas(fetchedSchemas);

		return json({ data: schemaData, success: true }, { status: 200 });
	} catch (error) {
		console.error('Error processing GET request:', error);
		return json({ error: 'Internal Server Error', success: false }, { status: 500 });
	}
};

function mergeSchemas(schemas: JSONSchema7[]): JSONSchema7 {
	const merged: JSONSchema7 = {
		type: 'object',
		properties: {},
		required: []
	};

	for (const schema of schemas) {
		if (schema.properties) {
			for (const [key, value] of Object.entries(schema.properties)) {
				if (!merged.properties![key]) {
					merged.properties![key] = value;
				}
			}
		}

		if (schema.required) {
			const requiredSet = new Set([...merged.required!, ...schema.required]);
			merged.required = [...requiredSet];
		}
	}

	return merged;
}
