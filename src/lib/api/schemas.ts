import { request } from '$lib/api/request';
import type { BasicSchema } from '$lib/types/schema';
import type { JSONSchema7 } from 'json-schema';

export const getSchemas = (url: string, customFetch?: typeof fetch) =>
	request<undefined, { name: string }[]>(url, 'GET', undefined, customFetch, false);

export const getSchema = (clusterUuid: string, customFetch?: typeof fetch) =>
	request<undefined, JSONSchema7>(
		`/api/clusters/${clusterUuid}/schema`,
		'GET',
		undefined,
		customFetch
	);

export const getLibrarySchemas = (libraryUrl: string, customFetch?: typeof fetch) =>
	request<undefined, BasicSchema[]>(
		`${libraryUrl}/v2/schemas`,
		'GET',
		undefined,
		customFetch,
		false
	);
